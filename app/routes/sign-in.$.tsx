//clerk sign-in page
import { SignIn } from "@clerk/remix";
 
export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn appearance={{
        elements: {
          footer: {
            display: 'none',
          },
        },
      }} />
    </div>
  );
}