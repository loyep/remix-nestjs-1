import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import remix from './remix';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(remix())
  await app.listen(3000);
}
bootstrap();
