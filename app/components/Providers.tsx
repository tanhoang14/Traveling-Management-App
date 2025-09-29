"use client"

import { SessionProvider } from "next-auth/react"
import React from "react";

const Providers = (props : any) => {
    return <SessionProvider>{props.children}</SessionProvider>
}

export default Providers;