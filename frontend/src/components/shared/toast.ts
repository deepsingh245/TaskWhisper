import { toast } from "sonner"

export const dangerToast = (message: string) =>{
    return toast.error(message);
}

export const successToast = (message: string) =>{
    return toast.success(message);
}

export const infoToast = (message: string) =>{
    return toast.info(message);
}

export const warningToast = (message: string) =>{
    return toast.warning(message);
}
