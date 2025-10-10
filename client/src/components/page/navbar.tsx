import { SunIcon } from "lucide-react";

export default function Navbar() {
    return (
        <div>
            <div className="h-16 bg-accent-foreground/10 backdrop-blur-sm sticky top-0 left-0 right-0 z-50 border-b border-b-accent/10">
                <div className="flex justify-between items-center h-full px-4 md:px-8 lg:px-16">
                    <img
                        src="https://scontent.fsgn24-2.fna.fbcdn.net/v/t39.8562-6/475210330_598195142840489_9172482348551739153_n.png?_nc_cat=1&ccb=1-7&_nc_sid=f537c7&_nc_ohc=U_HvaeY8wVoQ7kNvwHKFfGh&_nc_oc=AdmhAGXxonKz7FbUlulyP_b8TBbanNdLNuwRnwQ63Wv30D_4wsBYy5oUnb13xvk0vFwNzi6wNyZApRrzzcn-WAms&_nc_zt=14&_nc_ht=scontent.fsgn24-2.fna&_nc_gid=ytHr4qSlizztGUpX9bVJmQ&oh=00_AfcXmxuIS9NSd-Q6J6C08PnjJ3iGiD9Z3n2_saxm4-7J_g&oe=68EE7798"
                        alt=""
                        className="h-12 object-cover"
                    />
                    <div className="text-blue-950">Chao Mung Test den voi ZuesChat</div>
                    <div className="h-8">
                        <SunIcon />
                    </div>
                </div>
            </div>
        </div>
    );
}
