import ChangePasswordTabContent from "@/app/(dashboard)/view-profile/components/change-password-tab-content";
import EditProfileTabContent from "@/app/(dashboard)/view-profile/components/edit-profile-tab-content";
import NotificationPasswordTabContent from "@/app/(dashboard)/view-profile/components/notification-password-tab-content";
import ViewProfileSidebar from "@/app/(dashboard)/view-profile/components/view-profile-sidebar";
import { auth } from "@/auth";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

const metadata: Metadata = {
    title: "View Profile & User Details | WowDash Admin Dashboard",
    description:
        "Access detailed user profiles and personal information in the WowDash Admin Dashboard built with Next.js and Tailwind CSS.",
};

type ViewProfilePageProps = {
    searchParams: Promise<{ tab?: string }>;
};

const ALLOWED_TABS = new Set(["editProfile", "changePassword", "NotificationPassword"]);

const ViewProfile = async ({ searchParams }: ViewProfilePageProps) => {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/auth/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            name: true,
            email: true,
            phoneCountryCode: true,
            phone: true,
            department: true,
            designation: true,
            language: true,
            bio: true,
            dateOfBirth: true,
            birthTime: true,
            placeOfBirth: true,
            latitudeDeg: true,
            latitudeMin: true,
            latitudeDir: true,
            longitudeDeg: true,
            longitudeMin: true,
            longitudeDir: true,
            timezone: true,
            kpHoraryNumber: true,
        },
    });

    const params = await searchParams;
    const tabParam = params?.tab;
    const defaultTab =
        tabParam && ALLOWED_TABS.has(tabParam) ? tabParam : "editProfile";

    const dateOfBirth =
        user?.dateOfBirth ? user.dateOfBirth.toISOString().slice(0, 10) : "";

    const profile = {
        name: user?.name ?? "",
        email: user?.email ?? "",
        phoneCountryCode: user?.phoneCountryCode ?? "+91",
        phone: user?.phone ?? "",
        department: user?.department ?? "",
        designation: user?.designation ?? "",
        language: user?.language ?? "",
        bio: user?.bio ?? "",
        dateOfBirth,
        birthTime: user?.birthTime ?? "",
        placeOfBirth: user?.placeOfBirth ?? "",
        latitudeDeg: user?.latitudeDeg?.toString() ?? "",
        latitudeMin: user?.latitudeMin?.toString() ?? "",
        latitudeDir: user?.latitudeDir ?? "",
        longitudeDeg: user?.longitudeDeg?.toString() ?? "",
        longitudeMin: user?.longitudeMin?.toString() ?? "",
        longitudeDir: user?.longitudeDir ?? "",
        timezone: user?.timezone?.toString() ?? "",
        kpHoraryNumber: user?.kpHoraryNumber?.toString() ?? "",
    };

    return (
        <>
            <DashboardBreadcrumb title="View Profile" text="View Profile" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-4">
                    <ViewProfileSidebar profile={profile} />
                </div>

                <div className="col-span-12 lg:col-span-8">
                    <Card className="card">
                        <CardContent className="px-0">
                            <Tabs defaultValue={defaultTab} className="gap-4">
                                <TabsList className='active-gradient bg-transparent dark:bg-transparent rounded-none h-[50px]'>
                                    <TabsTrigger value="editProfile" className='py-2.5 px-4 font-semibold text-sm inline-flex items-center gap-3 dark:bg-transparent text-neutral-600 hover:text-primary dark:text-white dark:hover:text-blue-500 data-[state=active]:bg-gradient border-0 border-t-2 border-neutral-200 dark:border-neutral-500 data-[state=active]:border-primary dark:data-[state=active]:border-primary rounded-[0] data-[state=active]:shadow-none cursor-pointer'>
                                        Edit Profile
                                    </TabsTrigger>
                                    <TabsTrigger value="changePassword" className='py-2.5 px-4 font-semibold text-sm inline-flex items-center gap-3 dark:bg-transparent text-neutral-600 hover:text-primary dark:text-white dark:hover:text-blue-500 data-[state=active]:bg-gradient border-0 border-t-2 border-neutral-200 dark:border-neutral-500 data-[state=active]:border-primary dark:data-[state=active]:border-primary rounded-[0] data-[state=active]:shadow-none cursor-pointer'>
                                        Change Password
                                    </TabsTrigger>
                                    <TabsTrigger value="NotificationPassword" className='py-2.5 px-4 font-semibold text-sm inline-flex items-center gap-3 dark:bg-transparent text-neutral-600 hover:text-primary dark:text-white dark:hover:text-blue-500 data-[state=active]:bg-gradient border-0 border-t-2 border-neutral-200 dark:border-neutral-500 data-[state=active]:border-primary dark:data-[state=active]:border-primary rounded-[0] data-[state=active]:shadow-none cursor-pointer'>
                                        Notification Password
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="editProfile">
                                    <EditProfileTabContent profile={profile} />
                                </TabsContent>
                                <TabsContent value="changePassword">
                                    <ChangePasswordTabContent />
                                </TabsContent>
                                <TabsContent value="NotificationPassword">
                                    <NotificationPasswordTabContent />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                </div>
            </div>

        </>
    );
};
export default ViewProfile;
