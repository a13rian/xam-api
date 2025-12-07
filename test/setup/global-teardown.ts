export default async function globalTeardown(): Promise<void> {
  console.log(
    'Test suite completed. Database container will be stopped by posttest:e2e hook.',
  );
}
