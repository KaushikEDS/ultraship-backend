import { ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';

export const getGraphQLConfig = (
  configService: ConfigService,
): ApolloDriverConfig => ({
  autoSchemaFile: 'schema.gql',
  sortSchema: true,
  playground: configService.get<string>('GRAPHQL_PLAYGROUND') === 'true',
  context: ({ req, res }) => ({ req, res }),
  formatError: (error) => {
    return {
      message: error.message,
      statusCode: error.extensions?.statusCode || 500,
      timestamp: new Date().toISOString(),
    };
  },
  introspection: true,
  cache: 'bounded',
});

