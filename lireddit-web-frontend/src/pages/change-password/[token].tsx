import { Box, Button, Link } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React, { useState } from 'react'
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { toErrorMap } from '../../utils/toErrorMap';
import NextLink from 'next/link';


export const ChangePassword: NextPage<{ token: string }> = () => {
  const router = useRouter()
  // return (<div>token is: {token}</div>);
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState('');
  return (<Wrapper variant="small">
    <Formik
      initialValues={{ newPassword: '' }} onSubmit={async (values, { setErrors }) => {
        const response = await changePassword({ newPassword: values.newPassword, token: typeof router.query.token === "string" ? router.query.token : "", })

        if (response.data?.changePassword.errors) {
          const errorMap = toErrorMap(response.data.changePassword.errors);
          if ('token' in errorMap) {
            setTokenError(errorMap.token);
          }
          setErrors(errorMap);
        } else if (response.data?.changePassword.user) {
          router.push("/");
        }
      }
      }>
      {({ isSubmitting }) => (
        <Form>
          <InputField
            name='newPassword'
            placeholder='new password'
            label="New Password"
            type="password"
          />

          {tokenError ?
            <Box>
              <Box mr={2} color='red'>{tokenError}</Box>
              <NextLink href="/forgot-password">
                <Link>Click here to get a new token</Link>
              </NextLink>

            </Box>

            : null}
          <Button mt={4} type="submit" isLoading={isSubmitting} colorScheme="teal">Change Password</Button>


        </Form>
      )}
    </Formik>
  </Wrapper>)
}

// don't add this if it's not needed
// ChangePassword.getInitialProps = ({ query }) => {
//   return {
//     token: query.token as string
//   }
// }

export default withUrqlClient(createUrqlClient)(ChangePassword as any);