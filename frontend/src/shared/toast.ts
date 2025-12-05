import { toast } from "sonner"

const customToast = (message: string, type: "success" | "error" | "info" | "warning") =>{
    return toast[type](message, {
        position: "top-center",
        duration: 5000,
        richColors: true,
    })
}

export const dangerToast = (message: string) =>{
    return customToast(message, "error");
}

export const successToast = (message: string) =>{
    return customToast(message, "success");
}

export const infoToast = (message: string) =>{
    return customToast(message, "info");
}

export const warningToast = (message: string) =>{
    return customToast(message, "warning");
}
