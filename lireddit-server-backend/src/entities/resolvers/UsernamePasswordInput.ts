import { Field, InputType } from "type-graphql";

// you can make a class to store the args to only have one arg in the resolver


@InputType()
export class UsernamePasswordInput {
  @Field()
  email: string;
  @Field()
  username: string;
  @Field()
  password: string;
}
