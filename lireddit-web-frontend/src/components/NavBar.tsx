import React from 'react'
import { Box, Button, Flex, Heading, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
// import { isServer } from '../utils/isServer';
import { useRouter } from 'next/router';

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({ }) => {
  const router = useRouter();
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery(
    // {pause: isServer(),} // check if you need the query or does it just resurn null and you should skip it
  );
  let body = null;
  //data is loading
  if (fetching) {
    //user not logged in
  } else if (!data?.me) {
    body = (<>
      <NextLink href="/login">
        <Link color='white' mr={2}>Login</Link>
      </NextLink>

      <NextLink href="/register">
        <Link color='white' >Register</Link>
      </NextLink>
    </>
    )
    //user is logged in
  } else {
    body = (
      <Flex align="center">
        <NextLink href="create-post">
          <Button as={Link} mr={4}>Create Post</Button>
        </NextLink>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          onClick={async () => {
            await logout();
            router.reload();
          }}
          variant="link"
          isLoading={logoutFetching}
        >Logout</Button>
      </Flex >)
  }

  return (
    <Flex position="sticky" top={0} zIndex={1} p={4} bg='teal' align='center'>
      <Flex flex={1} m='auto' align='center' maxW={800}>
        <NextLink href="/">
          <Link>
            <Heading>LiReddit</Heading>
          </Link>
        </NextLink>
        <Box ml={"auto"}>
          {body}
        </Box>
      </Flex>


    </Flex>
  );
}