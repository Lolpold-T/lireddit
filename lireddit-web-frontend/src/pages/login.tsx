import React from 'react'
import { Form, Formik } from 'formik'
import { Box, Button, Flex, Link } from '@chakra-ui/react';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from "next/router";
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from 'next/link';



export const Login: React.FC<{}> = ({ }) => {
  const [, login] = useLoginMutation();
  const router = useRouter();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }} onSubmit={async (values, { setErrors }) => {
          const response = await login(values);
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            if (typeof router.query.next === 'string') {
              router.push(router.query.next);
            }
            else {
              router.push("/");
            }
          }
        }
        }>
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name='usernameOrEmail'
              placeholder='Username or Email'
              label="Username or Email"
            />
            <Box mt={4}>
              <InputField
                name='password'
                placeholder='password'
                label="Password"
                type="password"
              />
            </Box>
            <Flex mt={2}>
              <NextLink href="/forgot-password">
                <Link ml='auto'>forgot password?</Link>
              </NextLink>
            </Flex>


            <Button mt={4} type="submit" isLoading={isSubmitting} colorScheme="teal">Login</Button>


          </Form>
        )}
      </Formik>
    </Wrapper>
  );
}
// what ever work you name your tsx file is the route to that page

// use urql client to use the mutations
export default withUrqlClient(createUrqlClient)(Login);