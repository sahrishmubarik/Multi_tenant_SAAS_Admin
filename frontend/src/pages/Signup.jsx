import SignupCard from "@/components/SignupCard";
import AuthHeader from "@/components/AuthHeader";
export default function Signup(){
 return(
        <div className="min-h-screen bg-[#E5EEE4]">
   <AuthHeader />
 
   <main className="flex justify-center pt-8">
     <SignupCard />
   </main>
 </div>
 )
}