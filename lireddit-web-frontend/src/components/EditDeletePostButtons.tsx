import { Box, IconButton, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface EditDeletePostButtonsProps {
  id: number;
  authorId: number;
}


export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({ id, authorId }) => {
  const [, deletePost] = useDeletePostMutation();
  const [{ data: meData }] = useMeQuery();
  if (meData?.me?.id !== authorId) {
    return null;
  }
  return (
    <Box>
      <NextLink href='/post/edit/[id]' as={`/post/edit/${id}`}>
        <IconButton
          as={Link}
          ml='auto'
          aria-label="Edit Post"
          icon={<EditIcon />}
        ></IconButton>
      </NextLink>
      <IconButton
        ml='auto'

        aria-label="Delete Post"
        icon={<DeleteIcon />}
        onClick={() => {
          deletePost({ id })
        }
        }
      ></IconButton>


    </Box>
  )

}