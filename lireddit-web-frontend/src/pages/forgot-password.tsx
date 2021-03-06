import { Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import React, { useState } from 'react'
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';




export const ForgotPassword: React.FC<{}> = ({ }) => {
  const [complete, setComplete] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "" }} onSubmit={async (values) => {
          await forgotPassword(values)
          setComplete(true);
        }
        }>
        {({ isSubmitting }) => (
          complete ? <Box>We sent you an email to reset your password if that email exists</Box> :
            <Form>
              <InputField
                name='email'
                placeholder='email'
                label="Email"
                type="email"
              />
              <Button mt={4} type="submit" isLoading={isSubmitting} colorScheme="teal">Forgot Password</Button>
            </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

export default withUrqlClient(createUrqlClient)(ForgotPassword);