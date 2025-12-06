import { Plugin } from '@nestjs/apollo';
import {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from '@apollo/server';
import { GraphQLError } from 'graphql';
import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';

@Plugin()
export class QueryComplexityPlugin implements ApolloServerPlugin {
  private maxComplexity = 1000;

  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    const maxComplexity = this.maxComplexity;

    return {
      async didResolveOperation({ request, document, schema }) {
        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({ defaultComplexity: 1 }),
          ],
        });

        if (complexity > maxComplexity) {
          throw new GraphQLError(
            `Query is too complex: ${complexity}. Maximum allowed complexity: ${maxComplexity}`,
            {
              extensions: {
                code: 'QUERY_COMPLEXITY_EXCEEDED',
                complexity,
                maxComplexity,
              },
            },
          );
        }

        console.log(`Query Complexity: ${complexity} / ${maxComplexity}`);
      },
    };
  }
}

