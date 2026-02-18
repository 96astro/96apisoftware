'use client';

import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import AvatarUpload from './avatar-upload';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { handleProfileUpdate } from './actions/handleProfileUpdate';
import dynamic from "next/dynamic";

const CountryCodeCombobox = dynamic(
    () => import('@/components/shared/country-code-combobox'),
    { ssr: false }
);

type ProfileData = {
    name: string;
    email: string;
    image: string;
    phoneCountryCode: string;
    phone: string;
    department: string;
    designation: string;
    language: string;
    bio: string;
    dateOfBirth: string;
    birthTime: string;
    placeOfBirth: string;
    latitudeDeg: string;
    latitudeMin: string;
    latitudeDir: string;
    longitudeDeg: string;
    longitudeMin: string;
    longitudeDir: string;
    timezone: string;
    kpHoraryNumber: string;
};

const EditProfileTabContent = ({ profile }: { profile: ProfileData }) => {
    const [countryCode, setCountryCode] = React.useState(profile.phoneCountryCode || "+91");
    const [profileImage, setProfileImage] = React.useState(profile.image || "");

    return (
        <div>
            <h6 className="text-base text-neutral-600 dark:text-neutral-200 mb-4">Profile Image</h6>
            <div className="mb-6 mt-4">
                <AvatarUpload initialImage={profile.image} onImageChange={setProfileImage} />
            </div>

            <form action={handleProfileUpdate}>
                <input type="hidden" name="profileImageData" value={profileImage} />
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-6">
                    <div className="col-span-12 sm:col-span-6">
                        <div className="mb-5">
                            <Label htmlFor="name" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">
                                Full Name <span className="text-red-600">*</span>
                            </Label>
                            <Input name="name" type="text" id="name" placeholder="Enter Full Name" defaultValue={profile.name} required />
                        </div>
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <div className="mb-5">
                            <Label htmlFor="email" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">
                                Email <span className="text-red-600">*</span>
                            </Label>
                            <Input name="email" type="email" id="email" placeholder="Enter email address" defaultValue={profile.email} required />
                        </div>
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <div className="mb-5">
                            <Label className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Country Code</Label>
                            <CountryCodeCombobox
                                name="phoneCountryCode"
                                value={countryCode}
                                onChange={setCountryCode}
                            />
                        </div>
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <div className="mb-5">
                            <Label htmlFor="number" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Phone</Label>
                            <Input name="number" type="tel" id="number" placeholder="Enter phone number" defaultValue={profile.phone} />
                        </div>
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <div className="mb-5">
                            <Label htmlFor="department" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Department</Label>
                            <Input name="department" id="department" placeholder="Enter Department" defaultValue={profile.department} />
                        </div>
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <div className="mb-5">
                            <Label htmlFor="designation" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Designation</Label>
                            <Input name="designation" id="designation" placeholder="Enter Designation" defaultValue={profile.designation} />
                        </div>
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <div className="mb-5">
                            <Label htmlFor="language" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Language</Label>
                            <Input name="language" id="language" placeholder="Enter Language" defaultValue={profile.language} />
                        </div>
                    </div>
                    <div className="col-span-12">
                        <div className="mb-5">
                            <Label htmlFor="desc" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Description</Label>
                            <Textarea name="desc" id="desc" placeholder="Write Description" defaultValue={profile.bio} />
                        </div>
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <div className="mb-5">
                            <Label htmlFor="dateOfBirth" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Date of Birth</Label>
                            <Input name="dateOfBirth" type="date" id="dateOfBirth" defaultValue={profile.dateOfBirth} />
                        </div>
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <div className="mb-5">
                            <Label htmlFor="birthTime" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Birth Time</Label>
                            <Input name="birthTime" type="time" id="birthTime" defaultValue={profile.birthTime} />
                        </div>
                    </div>
                    <div className="col-span-12">
                        <div className="mb-5">
                            <Label htmlFor="placeOfBirth" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Place of Birth</Label>
                            <Input name="placeOfBirth" id="placeOfBirth" placeholder="Enter Place of Birth" defaultValue={profile.placeOfBirth} />
                        </div>
                    </div>
                    <div className="col-span-12 sm:col-span-4">
                        <div className="mb-5">
                            <Label htmlFor="latitudeDeg" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Latitude Degree</Label>
                            <Input name="latitudeDeg" type="number" id="latitudeDeg" placeholder="e.g. 18" defaultValue={profile.latitudeDeg} />
                        </div>
                    </div>
                    <div className="col-span-12 sm:col-span-4">
                        <div className="mb-5">
                            <Label htmlFor="latitudeMin" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Latitude Minute</Label>
                            <Input name="latitudeMin" type="number" id="latitudeMin" placeholder="e.g. 57" defaultValue={profile.latitudeMin} />
                        </div>
                    </div>
                    <div className="col-span-12 sm:col-span-4">
                        <div className="mb-5">
                            <Label className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Latitude Direction</Label>
                            <select
                                name="latitudeDir"
                                defaultValue={profile.latitudeDir}
                                className="h-12 w-full rounded-lg border border-neutral-300 bg-transparent px-3 text-sm outline-none focus:border-primary dark:border-neutral-600 dark:bg-slate-900/30"
                            >
                                <option value="">Select Latitude Dir</option>
                                <option value="N">N</option>
                                <option value="S">S</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-span-12 sm:col-span-4">
                        <div className="mb-5">
                            <Label htmlFor="longitudeDeg" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Longitude Degree</Label>
                            <Input name="longitudeDeg" type="number" id="longitudeDeg" placeholder="e.g. 72" defaultValue={profile.longitudeDeg} />
                        </div>
                    </div>
                    <div className="col-span-12 sm:col-span-4">
                        <div className="mb-5">
                            <Label htmlFor="longitudeMin" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Longitude Minute</Label>
                            <Input name="longitudeMin" type="number" id="longitudeMin" placeholder="e.g. 50" defaultValue={profile.longitudeMin} />
                        </div>
                    </div>
                    <div className="col-span-12 sm:col-span-4">
                        <div className="mb-5">
                            <Label className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Longitude Direction</Label>
                            <select
                                name="longitudeDir"
                                defaultValue={profile.longitudeDir}
                                className="h-12 w-full rounded-lg border border-neutral-300 bg-transparent px-3 text-sm outline-none focus:border-primary dark:border-neutral-600 dark:bg-slate-900/30"
                            >
                                <option value="">Select Longitude Dir</option>
                                <option value="E">E</option>
                                <option value="W">W</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <div className="mb-5">
                            <Label htmlFor="timezone" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Timezone</Label>
                            <Input name="timezone" type="number" step="0.25" id="timezone" placeholder="e.g. 5.5" defaultValue={profile.timezone} />
                        </div>
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <div className="mb-5">
                            <Label htmlFor="kpHoraryNumber" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">KP Horary Number</Label>
                            <Input name="kpHoraryNumber" type="number" id="kpHoraryNumber" placeholder="Enter KP Horary Number" defaultValue={profile.kpHoraryNumber} />
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-3">
                    <Button type="reset" variant="outline" className="h-[48px] border border-red-600 bg-transparent hover:bg-red-600/20 text-red-600 text-base px-14 py-[11px] rounded-lg">
                        Cancel
                    </Button>
                    <Button type="submit" className="h-[48px] text-base px-14 py-3 rounded-lg">
                        Save
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditProfileTabContent;
