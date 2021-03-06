import { Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import React, { useEffect } from 'react'
import { InputField } from '../components/InputField';
import { useCreatePosMutation, useMeQuery } from '../generated/graphql';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { Layout } from '../components/Layout';
import { useIsAuth } from '../utils/useIsAuth';



const CreatePost: React.FC<{}> = ({ }) => {
  const [, createPost] = useCreatePosMutation();
  const router = useRouter();
  useIsAuth(); // check if user is logged in
  return (
    <Layout variant='small'>
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values) => {
          const { error } = await createPost({ input: values });
          if (!error) {
            router.push("/");
          }

        }
        }>
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name='title'
              placeholder="title"
              label="Title"
            />
            <Box mt={4}>
              <InputField
                textarea
                name='text'
                placeholder='text...'
                label="Body"
              />
            </Box>



            <Button mt={4} type="submit" isLoading={isSubmitting} colorScheme="teal">Create Post</Button>


          </Form>
        )}
      </Formik>
    </Layout>
  );
}

export default withUrqlClient(createUrqlClient)(CreatePost);