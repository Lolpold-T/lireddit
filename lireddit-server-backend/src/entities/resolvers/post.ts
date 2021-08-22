// import { MyContext } from "src/types";
import { MyContext } from "src/types";
import { isAuth } from "../../utils/middleware/isAuth";
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { Post } from "../Post";
import { getConnection } from "typeorm";
import { Upvote } from "../Upvote";
import { User } from "../User";
// import { Upvote } from "../Upvote";

@InputType()
class PostInput{
  @Field()
  title: string
  @Field()
  text: string
}
@ObjectType()
class PaginatedPosts{
  @Field(()=> [Post])
  posts: Post[]
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver{

  @FieldResolver(() => String)
    textSnippet(@Root() post: Post){
      return post.text.slice(0, 50);
    }

  
  @FieldResolver(() => User)
    author(@Root() post: Post,
    @Ctx(){userLoader}: MyContext){
      return userLoader.load(post.authorId);
    }

    
  @FieldResolver(() => Int, {nullable:true})
    async voteStatus(@Root() post: Post,
    @Ctx(){upvoteLoader,req}: MyContext){
      if (!req.session.userId){
        return null;
      }
      const upvote= await upvoteLoader.load({postId:post.id, userId: req.session.userId});
      return upvote? upvote.value: null;
    }

@Mutation(()=> Boolean)
@UseMiddleware(isAuth)
async vote(
  @Arg('postId', ()=> Int) postId: number,
    @Arg('value', ()=> Int) value: number,
  @Ctx() {req}: MyContext
){
 
  const isUpvote=value !== -1;
  const _value =  isUpvote? 1: -1;
  const {userId} = req.session
   const upvote = await Upvote.findOne({where: {postId, userId}});
  // await Upvote.insert({
  //   userId,
  //   postId,
  //   value:_value,
  // });
  if (upvote && upvote.value !== _value){
  //the user has voted on the post before & are changing their vote
  await getConnection().transaction(async tm=>{
     await tm.query(`
      UPDATE upvote
    SET  value = $1
    WHERE "postId" =$2 AND "userId" =$3
      `, [_value, postId, userId]);

       await tm.query(`
      UPDATE post
    SET points = points+$1
    WHERE id =$2`,
    [2*_value, postId]
    )
    });
  
  } else if (!upvote){
    // never voted before
    await getConnection().transaction(async tm=>{
      await tm.query(`
      INSERT INTO upvote("userId", "postId", value)
    VALUES ($1,$2,$3)
      `, [userId, postId, _value]);

    await tm.query(`
      UPDATE post
    SET points = points+$1
    WHERE id =$2`,
    [_value, postId]
    )
    });
  }
  return true;
}


  //GET
  @Query(()=> PaginatedPosts) 
  async posts(
    @Arg('limit', ()=> Int) limit : number,
    // @Arg('offset') offset: number, // after x post paginate
     @Arg('cursor', ()=> String, {nullable: true}) cursor :  string | null,
    //  @Info() info: any other way to build an object
    @Ctx(){}: MyContext

  ): Promise<PaginatedPosts>{
    const realLimit = Math.min(50, limit);
     const realLimitPlusOne = realLimit+1;
    const replacements: any[] =  [realLimitPlusOne];

    // if (req.session.userId){
    //   replacements.push(req.session.userId)
    // }

    // let cursorIdx =3;
    if (cursor){
      
      replacements.push(new Date(parseInt(cursor)));
      // cursorIdx = replacements.length;
    }
     const posts = await getConnection().query(
        `SELECT 
        p.*
        FROM post p 
        ${cursor ? `where p."createdAt" < $2`: ""}
        ORDER BY p."createdAt" DESC
        LIMIT $1
        `, replacements
        
     );
      //one sql statement method
    //   const posts = await getConnection().query(
    //     `SELECT 
    //     p.*, 
    //     JSON_BUILD_OBJECT('id', u.id, 'username', u.username, 'email', u.email, 'createdAt', u."createdAt", 'updatedAt', u."updatedAt") author, 
    //     ${
    //       req.session.userId
    //       ? '(SELECT value FROM upvote WHERE "userId" = $2 AND "postId" = p.id) "voteStatus"' 
    //       : 'null as "voteStatus"'}
    //     FROM post p 
    //     INNER JOIN public.user u on u.id = p."authorId"
    //     ${cursor ? ` where p."createdAt < ${cursorIdx}` : ""}
    //     ORDER BY p."createdAt" DESC
    //     LIMIT $1
    //     `, replacements
        
    //  );
    //  query builder
    // const qb = getConnection()
    // .getRepository(Post)
    // .createQueryBuilder("p")
    // .orderBy('p."createdAt"', "DESC")
    // .innerJoinAndSelect(
    //   "p.author",
    //   "u",
    //   'u.id = p."authorId"',
    // )
    // .take(realLimitPlusOne)

    // if (cursor){
    //   qb.where('"createdAt" < :cursor', {cursor : new Date(parseInt(cursor))});
    // }
    // const posts = await qb.getMany();
    // check if there are more posts to paginate
    return {
      posts: posts.slice(0, realLimit), hasMore: posts.length === realLimitPlusOne
    };
    // return Post.find();
  }

  //GET
  @Query(()=> Post, {nullable: true})
  post(@Arg('id', ()=> Int) id: number): Promise<Post | undefined>{
    return Post.findOne(id, {relations: ['author']});
  }

  // INSERT
  @Mutation(()=> Post) 
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx(){req}: MyContext): Promise<Post>{
    
    //2 sql queries
    return Post.create({
      ...input,
      authorId: req.session.userId,
    }).save();
  }

  //UPDATE
  @Mutation(()=> Post, {nullable : true}) 
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', ()=> Int) id: number,
    @Arg('title') title: string, 
    @Arg('text') text: string,
    @Ctx() {req} : MyContext,
    ): Promise<Post|null>{
        const result = await getConnection()
        .createQueryBuilder()
        .update(Post)
        .set({title, text})
        .where('id = :id and "authorId" = :authorId', {id, authorId: req.session.userId})
        .returning("*")
        .execute();
        return result.raw[0];

    //   const post = await Post.findOne(id);
    //   if (!post){
    //     return null; // check if post was found
    //   }
    //   if (typeof title !== 'undefined'){
    //    await Post.update({id}, {title, text});
    //   }
    // return post;
  }

  
  //DELETE
  @Mutation(()=> Boolean) 
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('id', ()=> Int) id: number,
    @Ctx(){req}:MyContext
    ): Promise<boolean>{
      // non-cascading way
      // const post = await Post.findOne(id)
      // if(!post){
      //   return false
      // }
      // if ( post.authorId !== req.session.userId){
      //   throw new Error('not authorized')
      // }
      // await Upvote.delete({postId: id})
      // await Post.delete({id});
      await Post.delete({id, authorId:req.session.userId})
      return true;
    
  }

}






// @Resolver()
// export class PostResolver{

//   //GET
//   @Query(()=> [Post]) // query is for getting data
//   posts(
//     @Ctx() {em}: MyContext
//     ): Promise<Post[]>{
//     // await sleep(3000);
//     return em.find(Post, {});
//   }

//   //GET
//   @Query(()=> Post, {nullable: true})
//   post(
//     @Arg('id', () => Int) id: number, // changes the name of the schema
//     @Ctx() {em}: MyContext
//     ): Promise<Post | null>{
//     return em.findOne(Post, {id});
//   }

//   // INSERT
//   @Mutation(()=> Post) // mutation is for updating, inserting & deleting
//   async createPost(
//     // type String is inferred 
//     @Arg('title') title: string,
//     @Ctx() {em}: MyContext
//     ): Promise<Post>{
//       const post = em.create(Post,{title});
//       await em.persistAndFlush(post);
//     return post;
//   }

//   //UPDATE
//   @Mutation(()=> Post, {nullable : true}) // mutation is for updating, inserting & deleting
//   async updatePost(
//     @Arg('id') id: number,
//     @Arg('title', () => String, {nullable: true}) title: string, // you have to add the type if you want it to be nullable
//     @Ctx() {em}: MyContext
//     ): Promise<Post|null>{
//       const post = await em.findOne(Post, {id});
//       if (!post){
//         return null; // check if post was found
//       }
//       if (typeof title !== 'undefined'){
//         post.title = title;
//         await em.persistAndFlush(post);
//       }
//     return post;
//   }

  
//   //DELETE
//   @Mutation(()=> Boolean) 
//   async deletePost(
//     @Arg('id') id: number,
//     @Ctx() {em}: MyContext
//     ): Promise<boolean>{
//       try{
//         await em.nativeDelete(Post, {id});
//       }catch{
//         return false;
//       }
//       return true;
    
//   }

// }