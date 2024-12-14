"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation";
import Stripe from "stripe"

const stripe=new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-11-20.acacia",
})

export async function createCheckoutSession(credits:number){
    const {userId}=await auth();
    if(!userId){
        throw new Error("Not authenticated")
    }

    const session=await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: `${credits} credits`,
                    },
                    unit_amount: Math.round(credits*0.5*100), // 1 credit = 50 paise
                },
                quantity: 1,
            },
        ],
        customer_creation: "always",
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/create`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
        client_reference_id: userId.toString(),
        metadata: {
            credits
        }
    })
    return redirect(session.url!)
}