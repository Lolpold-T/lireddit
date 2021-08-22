// import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, BaseEntity,ManyToOne, OneToMany } from "typeorm";
import { Upvote } from "./Upvote";
import { User } from "./User";


@ObjectType()
@Entity()
export class Post extends BaseEntity{
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt : Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt : Date;
  
  @Field(()=> String)
  @Column()
  title!: string;

  @Field()
  @Column()
  authorId: number;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({type: "int", default: 0})
  points!: number;

    @Field(()=> Int, {nullable:true})
  voteStatus: number|null;

    @Field()
  @ManyToOne(()=> User, user=>user.posts)
  author: User;

   @OneToMany(()=> Upvote, (upvote) => upvote.post)
  upvotes: Upvote[];
}

 

// @ObjectType()
// @Entity()
// export class Post{
//   @Field(() => Int)
//   @PrimaryKey()
//   id!: number;

//   @Field(() => String)
//   @Property({type: "date"})
//   createdAt = new Date();

//   @Field(() => String)
//   @Property({type: 'date', onUpdate: () => new Date()})
//   updatedAt = new Date();
  
//   @Field(()=> String)
//   @Property({type: 'text'})
//   title!: string;
// }