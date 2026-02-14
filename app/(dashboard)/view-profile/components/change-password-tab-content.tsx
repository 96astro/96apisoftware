"use client"

import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { handleChangePassword } from './actions/handleChangePassword';

const ChangePasswordTabContent = () => {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (formData: FormData) => {
        setIsSubmitting(true);

        try {
            const result = await handleChangePassword(formData);

            if ("error" in result) {
                toast.error(result.error);
                return;
            }

            toast.success("Password updated successfully.");
        } catch (error) {
            toast.error("Unable to update password right now.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form action={onSubmit}>
            {/* New Password Field */}
            <div className="mb-5">
                <Label htmlFor="new-password" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">
                    New Password <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                    <Input
                        name="password"
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter New Password"
                        className="ps-5 pe-12 h-[48px] rounded-lg border border-neutral-300 dark:border-slate-700 focus:border-primary dark:focus:border-primary focus-visible:border-primary !shadow-none !ring-0"
                        required
                    />
                    <Button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 !p-0 bg-transparent hover:bg-transparent text-muted-foreground h-[unset]"
                    >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </Button>
                </div>
            </div>

            {/* Confirm Password Field */}
            <div className="mb-5">
                <Label htmlFor="confirm-password" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">
                    Confirmed Password <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                    <Input
                        name="confirmPassword"
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Enter Confirmed Password"
                        className="ps-5 pe-12 h-[48px] rounded-lg border border-neutral-300 dark:border-slate-700 focus:border-primary dark:focus:border-primary focus-visible:border-primary !shadow-none !ring-0"
                        required
                    />
                    <Button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 !p-0 bg-transparent hover:bg-transparent text-muted-foreground h-[unset]"
                    >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3">
                <Button
                    type="submit"
                    className="h-[48px] text-base px-10 py-3 rounded-lg"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            Updating...
                        </>
                    ) : (
                        "Update Password"
                    )}
                </Button>
            </div>
        </form>
    );
};

export default ChangePasswordTabContent;
