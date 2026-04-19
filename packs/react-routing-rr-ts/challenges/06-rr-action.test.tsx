// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createMemoryRouter,
  RouterProvider,
  Form,
  useActionData,
  type ActionFunctionArgs,
  type RouteObject,
} from 'react-router';
import React from 'react';

async function noteAction({ request }: ActionFunctionArgs): Promise<{ saved: string }> {
  const fd = await request.formData();
  return { saved: String(fd.get('text')) };
}

function NoteView() {
  const data = useActionData() as { saved: string } | undefined;
  return (
    <>
      <Form method="post">
        <label htmlFor="text">text</label>
        <input id="text" name="text" />
        <button type="submit">save</button>
      </Form>
      {data ? <p>saved: {data.saved}</p> : null}
    </>
  );
}

const routes: RouteObject[] = [
  { path: '/notes', action: noteAction, element: <NoteView /> },
];

describe('06 RR route action', () => {
  it('runs the action and surfaces useActionData', async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(routes, { initialEntries: ['/notes'] });
    render(<RouterProvider router={router} />);
    await user.type(screen.getByLabelText('text'), 'hello');
    await user.click(screen.getByRole('button', { name: 'save' }));
    await waitFor(() => expect(screen.getByText('saved: hello')).toBeDefined());
  });
});
