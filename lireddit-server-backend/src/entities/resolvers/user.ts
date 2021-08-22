import { MyContext } from "src/types";
import { Arg, Ctx, Field, FieldResolver, Mutation, ObjectType, Query, Resolver, Root } from "type-graphql";
import { User } from "../User";
import argon2 from 'argon2';
// import { EntityManager } from "@mikro-orm/postgresql";
import { COOKIE_NAME } from "../../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../../utils/validateRegister";
import { sendEmail } from "../../utils/sendEmail";
import jwt from "jsonwebtoken";
import { getConnection } from "typeorm";




@ObjectType()
class FieldError{
  @Field()
  field: string;
  @Field()
  message:string;
}


// a type your return from mutations
@ObjectType()
class UserResponse{
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[];  // optional
    @Field(()=> User, {nullable: true})
    user?: User;
  }


@Resolver(User)
export class UserResolver{
    
    @FieldResolver(()=> String)
    email(@Root() user: User, @Ctx() {req}: MyContext){
      // this is the current user and it's ok to show them their own email
      if (req.session.userId===user.id){
        return user.email;
      }
      // the current uses wants to see someone else's email
      return null;
    }

  @Mutation(()=> UserResponse)
  async changePassword(
    @Arg('token') token:string,
    @Arg('newPassword') newPassword:string,
    @Ctx(){ req}:MyContext
  ): Promise<UserResponse>{
         if (newPassword.length <= 2){
        return{ errors:[
              {field:'newPassword',
              message: 'length must be greater than 2'},
          ]};
        
    }
     const userId = jwt.verify(token, "secret", (_, decoded: any) => {
      return decoded?.userId;
    }) as any;

        if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "That token has expired",
          },
        ],
      };
    }
    const userIdNum = parseInt(userId);
    const user = await User.findOne( userIdNum);
    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }

   
    await User.update({id: userIdNum }, {
      password: await argon2.hash(newPassword)
    });
  

    //login user after password change
    req.session.userId = user.id;
    return { user };

  }


  @Mutation(()=>Boolean)
  async forgotPassword(
    @Arg('email') email:string,
  ){
    const user = await User.findOne({where:{ email}});
    if (!user){
      //email is not in the db
      return true;
    }
    let token = jwt.sign(
      {userId: user.id,},
      "secret",
      {expiresIn:"1h"}
    );
    sendEmail(email,  `<a href="http://localhost:3000/change-password/${token}">reset password</a>`);
    return true;
  }

  @Query(()=> User, {nullable:true})
    me(@Ctx() {req}: MyContext){
    if (!req.session.userId){
      return null;
    }
    return User.findOne(req.session.userId);;
  }

  @Mutation(()=> UserResponse)
  async register( 
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { req} : MyContext
  ): Promise<UserResponse>{
    const errors = validateRegister(options);
    if (errors){return {errors};}

    const hashedPassword = await argon2.hash(options.password)

    let user;
   try{
     // query builder
     //User.create({}).save();
     const result = await getConnection().createQueryBuilder().insert().into(User).values({
       username: options.username,
      email: options.email,
      password: hashedPassword,
    }
     ).returning('*').execute();
  
    user = result.raw[0];
   } catch(err){
     if (err.code === '23505' || err.detail.includes('already exists')){
       return {
         errors:[{
           field: "username",
           message: "username already taken",
         }]
       }
     }
      
   }
   //auto login the user when they register
   req.session.userId = user.id;
   return {user};
    
  }



  @Mutation(()=> UserResponse)
  async login( 
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req} : MyContext
  ){
    const user = await User.findOne(usernameOrEmail.includes('@')
    ?{where:{email:usernameOrEmail}} :
    {where:{username: usernameOrEmail}});
    if (!user){
      return{
        errors:[{
          field: 'usernameOrEmail',
          message: "username doesn't exist"
        }]
      }
    }
    // verify password
    const valid = await argon2.verify(user.password, password);
    if (!valid){
      return{
        errors: [
          {
            field: "password",
            message: "incorrect password",
          }
        ]
      }
    }
    req.session!.userId = user.id;
   return {user};
    
  }

  @Mutation(() => Boolean)
  logout(
    @Ctx() {req,res}: MyContext
  ){
    
    return new Promise((resolve)=> req.session.destroy(err=>{
        res.clearCookie(COOKIE_NAME);
      if (err){
          console.log(err);
          resolve(false);
          return
        }
        resolve(true);
    }));
  }

  

}

















// @ObjectType()
// class FieldError{
//   @Field()
//   field: string;
//   @Field()
//   message:string;
// }


// // a type your return from mutations
// @ObjectType()
// class UserResponse{
//     @Field(() => [FieldError], {nullable: true})
//     errors?: FieldError[];  // optional
//     @Field(()=> User, {nullable: true})
//     user?: User;
//   }


// @Resolver()
// export class UserResolver{
//   @Mutation(()=> UserResponse)
//   async changePassword(
//     @Arg('token') token:string,
//     @Arg('newPassword') newPassword:string,
//     @Ctx(){ em, req}:MyContext
//   ): Promise<UserResponse>{
//          if (newPassword.length <= 2){
//         return{ errors:[
//               {field:'newPassword',
//               message: 'length must be greater than 2'},
//           ]};
        
//     }
//      const userId = jwt.verify(token, "secret", (_, decoded: any) => {
//       return decoded?.userId;
//     }) as any;

//         if (!userId) {
//       return {
//         errors: [
//           {
//             field: "token",
//             message: "That token has expired",
//           },
//         ],
//       };
//     }
//     const user = await em.findOne(User, {id: userId});
//     if (!user) {
//       return {
//         errors: [
//           {
//             field: "token",
//             message: "user no longer exists",
//           },
//         ],
//       };
//     }

//     user.password = await argon2.hash(newPassword);
//     await em.persistAndFlush(user);
    
//     // await em.update(
//     //   { id: userId },
//     //   {
//     //     password: await argon2.hash(newPassword),
//     //   }
//     // );

//     //login user after password change
//     req.session.userId = user.id;
//     return { user };

//   }


//   @Mutation(()=>Boolean)
//   async forgotPassword(
//     @Arg('email') email:string,
//     @Ctx() {em} : MyContext
//   ){
//     const user = await em.findOne(User, { email});
//     if (!user){
//       //email is not in the db
//       return true;
//     }
//     let token = jwt.sign(
//       {userId: user.id,},
//       "secret",
//       {expiresIn:"1h"}
//     );
//     sendEmail(email,  `<a href="http://localhost:3000/change-password/${token}">reset password</a>`);
//     return true;
//   }

//   @Query(()=> User, {nullable:true})
//   async me(@Ctx() {req, em}: MyContext){
//     // you are not logged int
//     if (!req.session.userId){
//       return null;
//     }
//     const user = await em.findOne(User, {id: req.session.userId});
//     return user;
//   }

//   @Mutation(()=> UserResponse)
//   async register( 
//     @Arg('options') options: UsernamePasswordInput,
//     @Ctx() {em, req} : MyContext
//   ): Promise<UserResponse>{
//     const errors = validateRegister(options);
//     if (errors){return {errors};}
//     // argon2 for hashing the password, if a package has ts file, the types are probably built in
//     const hashedPassword = await argon2.hash(options.password)
//     // const user = em.create(User, {
//     //   username:options.username,
//     //   password: hashedPassword,
//     // });
//     let user;
//    try{
//      // query builder
//     const result = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({
//       username: options.username,
//       email: options.email,
//       password: hashedPassword,
//       created_at: new Date(),
//       updated_at: new Date(),
//     }).returning("*");
//     user = result[0];
//     // await em.persistAndFlush(user);

//    } catch(err){
//      if (err.code === '23505' || err.detail.includes('already exists')){
//        return {
//          errors:[{
//            field: "username",
//            message: "username already taken",
//          }]
//        }
//      }
      
//    }
//    //auto login the user when they register
//    req.session.userId = user.id;
//    return {user};
    
//   }



//   @Mutation(()=> UserResponse)
//   async login( 
//     @Arg('usernameOrEmail') usernameOrEmail: string,
//     @Arg("password") password: string,
//     @Ctx() {em, req} : MyContext
//   ){
//     const user = await em.findOne(User, usernameOrEmail.includes('@')?{email:usernameOrEmail} :
//     {username: usernameOrEmail});
//     if (!user){
//       return{
//         errors:[{
//           field: 'usernameOrEmail',
//           message: "username doesn't exist"
//         }]
//       }
//     }
//     // verify password
//     const valid = await argon2.verify(user.password, password);
//     if (!valid){
//       return{
//         errors: [
//           {
//             field: "password",
//             message: "incorrect password",
//           }
//         ]
//       }
//     }
//     req.session!.userId = user.id;
//    return {user};
    
//   }

//   @Mutation(() => Boolean)
//   logout(
//     @Ctx() {req,res}: MyContext
//   ){
    
//     return new Promise((resolve)=> req.session.destroy(err=>{
//         res.clearCookie(COOKIE_NAME);
//       if (err){
//           console.log(err);
//           resolve(false);
//           return
//         }
//         resolve(true);
//     }));
//   }

  

// }