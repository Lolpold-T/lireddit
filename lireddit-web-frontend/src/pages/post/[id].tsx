import { Box, Heading } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import React from 'react';
import { EditDeletePostButtons } from '../../components/EditDeletePostButtons';
import { Layout } from '../../components/Layout';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';



export const Post = ({ }) => {

  const [{ data, fetching, error }] = useGetPostFromUrl();

  if (fetching) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    )
  }
  if (error) {
    return <div>{error.message}</div>
  }

  if (!data?.post) {
    return <Layout>
      <Box>Could not find post</Box>
    </Layout>
  }

  return (
    <Layout>
      <Heading mb={4}>{data?.post.title}</Heading>
      <Box mb={4}>
        {data?.post?.text}
      </Box>
      <EditDeletePostButtons id={data.post.id} authorId={data.post.author.id} />
    </Layout>
  );
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);

