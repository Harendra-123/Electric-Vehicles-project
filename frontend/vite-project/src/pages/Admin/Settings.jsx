// import React from "react";

// import {
//   ShieldCheck,
//   LogOut,
// } from "lucide-react";

// import AdminLayout from "../../layouts/AdminLayout";

// import "./Settings.css";


// const Settings = () => {

//   // Registered users
//   const users = [
//     {
//       id: 1,
//       name: "Demo Rider",
//       email: "user@voltride.com",
//     },
//     {
//       id: 2,
//       name: "Krishna Kumar ahirwar",
//       email: "krishnakumarahirwar322@gmail.com",
//     },
//   ];


//   // Sign out
//   const handleLogout = () => {
//   localStorage.removeItem("token");

//   // Agar user information bhi save ki hai
//   localStorage.removeItem("user");

//   window.location.href = "/login";
// };


//   return (
//     <AdminLayout>

//       <div className="settings-page">


//         {/* =================================
//             ADMIN PROFILE
//         ================================= */}

//         <section className="admin-profile-card">

//           <div className="admin-icon">

//             <ShieldCheck
//               size={30}
//               strokeWidth={2.5}
//             />

//           </div>


//           <h1>
//             Admin
//           </h1>


//           <p>
//             admin@voltride.com
//           </p>

//         </section>



//         {/* ================================
//             REGISTERED USERS
//         ================================= */}

//         <section className="registered-users-card">

//           <h2>
//             Registered Users ({users.length})
//           </h2>


//           <div className="users-list">

//             {users.map((user) => (

//               <div
//                 className="registered-user"
//                 key={user.id}
//               >

//                 {/* Avatar */}

//                 <div className="user-avatar">

//                   {user.name
//                     .charAt(0)
//                     .toUpperCase()}

//                 </div>


//                 {/* User Information */}

//                 <div className="user-information">

//                   <h3>
//                     {user.name}
//                   </h3>

//                   <p>
//                     {user.email}
//                   </p>

//                 </div>

//               </div>

//             ))}

//           </div>

//         </section>



//         {/* =================================
//             SIGN OUT
//         ================================= */}

//         <button
//           className="sign-out-button"
//           onClick={handleLogout}
//         >

//           <LogOut
//             size={15}
//             strokeWidth={2.5}
//           />

//           <span>
//             Sign Out
//           </span>

//         </button>


//       </div>

//     </AdminLayout>
//   );
// };


// export default Settings;










import React, { useState, useEffect } from "react";
import { ShieldCheck, LogOut } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import "./Settings.css";

const Settings = () => {
  // 1. Data aur Filter ke liye States
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'user', 'driver'

  // 2. Backend API se Real-time Connect karne ke liye useEffect
  useEffect(() => {
    fetchDataFromBackend();
  }, []);

  const fetchDataFromBackend = async () => {
    try {
      const token = localStorage.getItem("token"); // Auth Token

      // Aapka Backend API Endpoint (Port update kar lein agar 5000 se alag hai)
      const response = await fetch("http://localhost:5000/api/admin/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Agar Authentication API hai
        },
      });

      const data = await response.json();

      if (response.ok) {
        setAccounts(data); // Backend se aane wala data state me set hoga
      } else {
        console.error("Failed to fetch data:", data.message);
      }
    } catch (error) {
      console.error("Backend Connection Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Admin filter logic (User / Driver)
  const filteredAccounts = accounts.filter((item) => {
    if (filter === "user") return item.role === "user" || item.role === "rider";
    if (filter === "driver") return item.role === "driver";
    return true; // All
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <AdminLayout>
      <div className="settings-page">
        {/* ADMIN PROFILE */}
        <section className="admin-profile-card">
          <div className="admin-icon">
            <ShieldCheck size={30} strokeWidth={2.5} />
          </div>
          <h1>Admin</h1>
          <p>admin@voltride.com</p>
        </section>

        {/* REGISTERED ACCOUNTS WITH FILTER */}
        <section className="registered-users-card">
          <div className="card-header">
            <h2>Registered Accounts ({filteredAccounts.length})</h2>

            {/* Filter Buttons */}
            <div className="filter-tabs">
              <button
                className={`filter-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button
                className={`filter-btn ${filter === "user" ? "active" : ""}`}
                onClick={() => setFilter("user")}
              >
                Users
              </button>
              <button
                className={`filter-btn ${filter === "driver" ? "active" : ""}`}
                onClick={() => setFilter("driver")}
              >
                Drivers
              </button>
            </div>
          </div>

          <div className="users-list">
            {loading ? (
              <p>Loading accounts...</p>
            ) : filteredAccounts.length === 0 ? (
              <p>No accounts found.</p>
            ) : (
              filteredAccounts.map((user) => (
                <div className="registered-user" key={user._id || user.id}>
                  <div className="user-avatar">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="user-information">
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* SIGN OUT */}
        <button className="sign-out-button" onClick={handleLogout}>
          <LogOut size={15} strokeWidth={2.5} />
          <span>Sign Out</span>
        </button>
      </div>
    </AdminLayout>
  );
};

export default Settings;