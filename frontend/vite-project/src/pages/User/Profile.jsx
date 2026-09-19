import React, { useEffect, useState } from "react";

import {
    CreditCard,
    Star,
    Gift,
    Bell,
    CircleHelp,
    Leaf,
    ChevronRight,
    Car,
    Clock3,
    UserCircle,
    LogOut,
    Settings,
    Pencil
} from "lucide-react";

import { getUserProfile } from "../../services/rideApi";

import "./Profile.css";

const defaultUser = {
    name: "Demo Rider",
    email: "user@voltride.com",
};

const Profile = () => {
    const [user, setUser] = useState(defaultUser);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const result = await getUserProfile();

                if (result?.user) {
                    setUser({ ...defaultUser, ...result.user });
                    localStorage.setItem("user", JSON.stringify(result.user));
                } else {
                    const storedUser = localStorage.getItem("user");

                    if (storedUser) {
                        setUser({ ...defaultUser, ...JSON.parse(storedUser) });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch user profile", error);

                const storedUser = localStorage.getItem("user");

                if (storedUser) {
                    setUser({ ...defaultUser, ...JSON.parse(storedUser) });
                }
            }
        };

        loadUser();
    }, []);

    const profileOptions = [
        {
            icon: Pencil,
            title: "Edit profile",
            subtitle: "Update name, email and phone",
            path: "/user/profile/edit"
        },
        {
            icon: Settings,
            title: "Settings",
            subtitle: "Manage account preferences",
            path: "/user/settings"
        },
        {
            icon: CreditCard,
            title: "Payment Methods",
            subtitle: "Manage cards, UPI & wallets",
            path: "/user/payment"
        },
        {
            icon: Star,
            title: "Favorite Places",
            subtitle: "Home, work & more"
        },
        {
            icon: Gift,
            title: "Refer & Earn",
            subtitle: "Get ₹100 per referral"
        },
        {
            icon: Bell,
            title: "Notifications",
            subtitle: "Manage alerts"
        },
        {
            icon: CircleHelp,
            title: "Help & Support",
            subtitle: "FAQs & contact us"
        },
        {
            icon: Leaf,
            title: "CO₂ Impact",
            subtitle: "View your green impact"
        }
    ];

    const handleOptionClick = (title, path) => {
        if (path) {
            window.location.href = path;
            return;
        }

        console.log(`${title} clicked`);
    };

    const handleSignOut = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    return (
        <div className="user-profile-page">
            <section className="profile-header">
                <div className="profile-avatar">
                    {(user.name || "D").charAt(0).toUpperCase()}
                </div>

                <h1>{user.name}</h1>
                <p>{user.email}</p>
            </section>

            <main className="profile-content">
                <div className="profile-options">
                    {profileOptions.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <button
                                className="profile-option"
                                key={index}
                                onClick={() => handleOptionClick(item.title, item.path)}
                            >
                                <div className="profile-option-icon">
                                    <Icon size={18} />
                                </div>

                                <div className="profile-option-content">
                                    <span className="profile-option-title">
                                        {item.title}
                                    </span>

                                    <span className="profile-option-subtitle">
                                        {item.subtitle}
                                    </span>
                                </div>

                                <ChevronRight className="profile-option-arrow" size={21} />
                            </button>
                        );
                    })}
                </div>

                <button className="profile-signout" onClick={handleSignOut}>
                    <LogOut size={16} />
                    <span>Sign Out</span>
                </button>
            </main>

            <nav className="user-profile-bottom-nav">
                <button className="profile-nav-item" onClick={() => { window.location.href = "/user/home"; }}>
                    <Car size={21} />
                    <span>Ride</span>
                </button>

                <button className="profile-nav-item" onClick={() => { window.location.href = "/user/history"; }}>
                    <Clock3 size={21} />
                    <span>History</span>
                </button>

                <button className="profile-nav-item active">
                    <UserCircle size={21} />
                    <span>Profile</span>
                </button>
            </nav>
        </div>
    );
};

export default Profile;