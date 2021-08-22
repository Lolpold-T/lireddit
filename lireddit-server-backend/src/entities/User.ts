// import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn,BaseEntity, OneToMany } from "typeorm";
import { Post } from "./Post";
import { Upvote} from "./Upvote";


@ObjectType()
@Entity()
export class User extends BaseEntity{
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
  @Column({unique: true})
  username!: string;

  @Field(()=> String)
  @Column({unique: true})
  email!: string;

  @Column()
  password!: string;
  
  @OneToMany(()=> Post, post => post.author)
  posts: Post[]

  @OneToMany(()=> Upvote, (upvote) => upvote.user)
  upvotes: Upvote[];


}



// @ObjectType()
// @Entity()
// export class User{
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
//   @Property({type: 'text', unique: true})
//   username!: string;

//   @Field(()=> String)
//   @Property({type: 'text', unique: true})
//   email!: string;

//   @Property({type: 'text'})
//   password!: string;
// }

