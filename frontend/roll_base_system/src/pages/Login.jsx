import LoginCard from "../components/LoginCard.jsx";
import AuthHeader from "../components/AuthHeader";
export default function Login(){
 return( 
        <div className="min-h-screen bg-[#E5EEE4]">
  <AuthHeader />

  <main className="flex justify-center pt-8">
    <LoginCard />
  </main>
</div>
 )
}