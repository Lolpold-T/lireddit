import React from 'react'
import { Form, Formik } from 'formik'
import { Box, Button } from '@chakra-ui/react';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
// import { useMutation } from 'urql';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from "next/router";
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';


interface registerProps {

}

// const REGISTER_MUTATION = `mutation Register($username : String!, $password: String!)
// {
//   register(options: {username: $username, password:$password}){
//     errors{
//       field
//       message

//     }
//     user{
//        id
//     	username
//     }

//   }

// }`


export const Register: React.FC<registerProps> = ({ }) => {
  // const [, register] = useMutation(REGISTER_MUTATION)
  const [, register] = useRegisterMutation();
  const router = useRouter();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "", username: "", password: "" }} onSubmit={async (values, { setErrors }) => {
          const response = await register({ options: values });
          if (response.data?.register.errors) { // optional chaining
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
            //worked
            router.push("/");
          }
        }
        }>
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name='username'
              placeholder='username'
              label="Username"
            />
            <Box mt={4}>
              <InputField
                name='email'
                placeholder='email'
                label="Email"

              />
            </Box>

            <Box mt={4}>
              <InputField
                name='password'
                placeholder='password'
                label="Password"
                type="password"
              />
            </Box>

            <Button mt={4} type="submit" isLoading={isSubmitting} colorScheme="teal">Register</Button>


          </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

// what ever work you name your tsx file is the route to that page

export default withUrqlClient(createUrqlClient, { ssr: true })(Register);