import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";

type CustomAlertProps = {
    trigger: React.ReactNode;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
};

export function CustomAlert({
    trigger,
    title = "Peringatan",
    description = "Apakah kamu yakin ingin melanjutkan?",
    confirmText = "Lanjutkan",
    cancelText = "Batal",
    onConfirm,
}: CustomAlertProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>{confirmText}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
