import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react'
// import { cacheExchange } from '@urql/exchange-graphcache';
// import { Provider, createClient, dedupExchange, fetchExchange } from 'urql'
// import { LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation } from '../generated/graphql';
import theme from '../theme'
// import { betterUpdateQuery } from './betterUpdateQuery';

// const client = createClient({
//   url: 'http://localhost:4000/graphql',
//   fetchOptions: {
//     credentials: "include",
//   },
//   //update the cache when you log in and register
//   exchanges: [dedupExchange, cacheExchange({
//     updates: {
//       Mutation: {
//         logout: (_result, args, cache, info) => {
//           betterUpdateQuery<LogoutMutation, MeQuery>(cache,
//             { query: MeDocument },
//             _result,
//             () => ({ me: null }));
//         },

//         login: (_result, args, cache, info) => {

//           betterUpdateQuery<LoginMutation, MeQuery>(cache, { query: MeDocument }, _result, (result, query) => {
//             if (result.login.errors) {
//               return query;
//             } else {
//               return {
//                 me: result.login.user,
//               }
//             }
//           }
//           );
//         },

//         register: (_result, args, cache, info) => {

//           betterUpdateQuery<RegisterMutation, MeQuery>(cache, { query: MeDocument }, _result, (result, query) => {
//             if (result.register.errors) {
//               return query;
//             } else {
//               return {
//                 me: result.register.user,
//               }
//             }
//           });
//         }
//       }
//     },
//   }), fetchExchange]
// });

function MyApp({ Component, pageProps }: any) {
  return (
    // <Provider value={client}>
    <ChakraProvider resetCSS theme={theme}>
      <ColorModeProvider
        options={{
          useSystemColorMode: true,
        }}
      >
        <Component {...pageProps} />
      </ColorModeProvider>
    </ChakraProvider>
    // </Provider>
  )
}

export default MyApp
