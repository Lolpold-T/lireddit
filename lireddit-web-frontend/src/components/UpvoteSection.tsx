import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, IconButton } from '@chakra-ui/react';
import React, { useState } from 'react'
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

interface UpvoteSectionProps {
  // post: PostQuery["posts"]["posts"][0];
  post: PostSnippetFragment;
}

export const UpvoteSection: React.FC<UpvoteSectionProps> = ({ post }) => {
  const [, vote] = useVoteMutation();
  const [loadingState, setLoadingState] = useState<"upvote-loading" | "downvote-loading" | "not-loading">("not-loading");
  return (
    <Flex
      direction="column" alignItems='center' mr={4} justifyContent='center'>
      <IconButton
        aria-label="upvote post"
        icon={<ChevronUpIcon />}
        colorScheme={post.voteStatus === 1 ? "green" : undefined}
        isLoading={loadingState === "upvote-loading"}
        onClick={async () => {
          if (post.voteStatus === 1) {
            return;
          }
          setLoadingState("upvote-loading")
          vote({
            postId: post.id,
            value: 1,
          })
          setLoadingState("not-loading")
        }}
      />
      {post.points}
      <IconButton
        aria-label="downvote post"
        isLoading={loadingState === "upvote-loading"}
        colorScheme={post.voteStatus === -1 ? "red" : undefined}
        icon={<ChevronDownIcon />}
        onClick={async () => {
          if (post.voteStatus === -1) {
            return;
          }
          setLoadingState("upvote-loading")
          vote({
            postId: post.id,
            value: -1,
          })
          setLoadingState("not-loading")
        }}
      />
    </Flex>
  );
}