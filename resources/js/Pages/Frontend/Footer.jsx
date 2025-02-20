import React from "react";
export default function Footer ()
{
    return (
        <footer className="bg-[#133e5e] text-white py-4 sm:mt-8 mt-0 dark:bg-gray-900 dark:text-white">
                <div className="container mx-auto text-center dark:text-white">
                    <p>
                        <p>
                            &copy; {new Date().getFullYear()} Fidelis
                            Technologies. All Rights Reserved.
                        </p>
                    </p>
                </div>
            </footer>
    )
}