import React, { useState } from "react";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import NextLink from 'next/link';
import { Text, Box, Heading, Stack, Flex, Link, Button } from "@chakra-ui/react";
import { UpvoteSection } from "../components/UpvoteSection";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";

// https://mockaroo.com/ for fake table data
const Index = () => {
  const [variables, setVariables] = useState({ limit: 15, cursor: null as null | string, });
  const [{ data, fetching }] = usePostsQuery({
    variables
  });



  if (!fetching && !data) {
    return <div>query failed</div>
  }
  return (
    <Layout>


      {!data && fetching ?
        <div>loading...</div>
        :
        <Stack spacing={8}>
          {data!.posts.posts.map((p) => !p ? null : (
            <Flex key={p.id} p={5} shadow="md" borderWidth="1px" >
              <UpvoteSection post={p} />
              <Box flex={1}>
                <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                  <Link>
                    <Heading fontSize="xl">{p.title}</Heading>
                  </Link>
                </NextLink>


                <Text>posted by {p.author.username}</Text>
                <Flex align='center' >
                  <Text flex={1} mt={4}>{p.textSnippet}</Text>
                  <Box ml="auto">
                    <EditDeletePostButtons id={p.id} authorId={p.author.id} />

                  </Box>
                </Flex>


              </Box>

            </Flex>
          )
          )}
        </Stack>
      }
      {
        data && data.posts.hasMore ?
          <Flex>
            <Button
              onClick={() => {
                setVariables({
                  limit: variables.limit,
                  cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
                })
              }}
              isLoading={fetching}
              m="auto"
              my={4}>
              load more
            </Button>
          </Flex>
          : null
      }

    </Layout >
  );


}
// server side rendering (ssr) is better for SEO because the data can be evaluated immediatly instead of the filler html while data is loading client side
// Usually use ssr when the data is dynamic & you want it to be found by the search engine. Next.js will change back to client side rendering if you are routing back to a page
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
