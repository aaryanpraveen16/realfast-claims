import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { env } from './config/env';

import { globalErrorHandler } from './middleware/errorHandler';

import { authRouter } from './modules/auth/auth.router';
import { membersRouter } from './modules/members/members.router';
import { policiesRouter } from './modules/policies/policies.router';
import { claimsRouter } from './modules/claims/claims.router';
import { providersRouter } from './modules/providers/providers.router';
import { adjudicationRouter } from './modules/adjudication/adjudication.router';
import { disputesRouter } from './modules/disputes/disputes.router';
import { adminRouter } from './modules/admin/admin.router';
import { paymentsRouter } from './modules/payments/payments.router';
import { underwritingRouter } from './modules/underwriting/underwriting.router';


// Start BullMQ workers
import './jobs/adjudicationWorker';
import './jobs/slaAlertWorker';
import './jobs/eobGenerationWorker';

const fastify = Fastify({
  logger: true,
});

// Register Plugins
fastify.register(cors);
fastify.register(jwt, {
  secret: env.JWT_SECRET,
});

fastify.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

fastify.register(fastifyStatic, {
  root: path.join(__dirname, '../public/uploads'),
  prefix: '/uploads/',
});


// Register Global Error Handler
fastify.setErrorHandler(globalErrorHandler);

// Register Routes
fastify.register(authRouter, { prefix: '/api/auth' });
fastify.register(membersRouter, { prefix: '/api/members' });
fastify.register(policiesRouter, { prefix: '/api/policies' });

fastify.register(claimsRouter, { prefix: '/api/claims' });
fastify.register(providersRouter, { prefix: '/api/providers' });
fastify.register(adjudicationRouter, { prefix: '/api/adjudication' });
fastify.register(disputesRouter, { prefix: '/api/disputes' });
fastify.register(adminRouter, { prefix: '/api/admin' });
fastify.register(paymentsRouter, { prefix: '/api/payments' });
fastify.register(underwritingRouter, { prefix: '/api/underwriting' });


// Health Check
fastify.get('/health', async () => {
  return { status: 'ok' };
});

const start = async () => {
  try {
    await fastify.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`Server is running at http://localhost:${env.PORT}`);
    
    // Log all registered routes on startup
    console.log('Registered Routes:');
    console.log(fastify.printRoutes());
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
