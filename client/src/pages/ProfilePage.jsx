import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import assets, { imagesDummyData } from '../assets/assets'
import { AuthContext } from '../../context/AuthContext';
const ProfilePage = () => {

  const {authUser,updateProfile}=useContext(AuthContext)

const [selectedimage,setselectedimage]=useState(null);
const navigate=useNavigate();
const [name,setname]=useState(authUser.fullname);
const [bio,setBio]=useState(authUser.bio)


const handleSubmit= async(e)=>{
e.preventDefault();
if(!selectedimage)
{
  await updateProfile({fullname:name,bio})
  console.log(name)
  navigate('/');
  return;
}
const reader =new FileReader();
reader.readAsDataURL(selectedimage);
reader.onload = async () => {
  const base64Image = reader.result;
  await updateProfile({profilePic:base64Image,fullname:name,bio})
  navigate('/')
}
}



  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
       
      <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-5 p-10 flex-1'>
         <h3 className='text-lg'>Profile Details</h3>
         <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
          <input onChange={(e)=>setselectedimage(e.target.files[0])} type="file" name="" id="avatar" accept='.png, .jpg, .jpeg' hidden />
           <img src={selectedimage ? URL.createObjectURL(selectedimage): assets.avatar_icon } className={`w-12 h-12 ${selectedimage && 'rounded-full'}`}  />
           Upload Profile Image
         </label>
         
         <input onChange={(e)=>setname(e.target.value)} value={name} 
         type="text" name="" id="" required placeholder='Your Name' className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500' />

        <textarea onChange={(e)=>setBio(e.target.value)} value={bio}  rows={4} placeholder='Write Profile Bio'  className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500' ></textarea>
          
      <button type="submit" className='p-2 text-lg bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'>Save</button>
        </form>
         <img src={authUser?.profilePic || assets.logo_icon} alt="" className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10  ${selectedimage && 'rounded-full'}`} />
      
      </div>

    </div>
  )
}

export default ProfilePage



// import React, { useContext, useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom';
// import assets from '../assets/assets';
// import { AuthContext } from '../../context/AuthContext';

// const ProfilePage = () => {
//   const { authUser, updateProfile } = useContext(AuthContext);

//   const navigate = useNavigate();

//   // Local states
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [name, setName] = useState('');
//   const [bio, setBio] = useState('');

//   // Load user data once context is ready
//   useEffect(() => {
//     if (authUser) {
//       setName(authUser.fullname || '');
//       setBio(authUser.bio || '');
//     }
//   }, [authUser]);

//   // Handle Profile Update
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!selectedImage) {
//       await updateProfile({ fullname: name, bio });
//       navigate('/');
//       return;
//     }

//     const reader = new FileReader();
//     reader.readAsDataURL(selectedImage);
//     reader.onload = async () => {
//       const base64Image = reader.result;
//       await updateProfile({ profilePic: base64Image, fullname: name, bio });
//       navigate('/');
//     };
//   };

//   return (
//     <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
//       <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">
        
//         {/* Profile Form */}
//         <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-10 flex-1">
//           <h3 className="text-lg">Profile Details</h3>

//           {/* Upload Image */}
//           <label htmlFor="avatar" className="flex items-center gap-3 cursor-pointer">
//             <input
//               onChange={(e) => setSelectedImage(e.target.files[0])}
//               type="file"
//               id="avatar"
//               accept=".png, .jpg, .jpeg"
//               hidden
//             />
//             <img
//               src={selectedImage ? URL.createObjectURL(selectedImage) : (authUser?.profilePic || assets.avatar_icon)}
//               alt="Profile Preview"
//               className={`w-12 h-12 rounded-full object-cover`}
//             />
//             Upload Profile Image
//           </label>

//           {/* Name Field */}
//           <input
//             onChange={(e) => setName(e.target.value)}
//             value={name}
//             type="text"
//             required
//             placeholder="Your Name"
//             className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
//           />

//           {/* Bio Field */}
//           <textarea
//             onChange={(e) => setBio(e.target.value)}
//             value={bio}
//             rows={4}
//             placeholder="Write Profile Bio"
//             className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
//           ></textarea>

//           {/* Save Button */}
//           <button
//             type="submit"
//             className="p-2 text-lg bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer"
//           >
//             Save
//           </button>
//         </form>

//         {/* Right Side Image Display */}
//         <img
//           src={
//             selectedImage
//               ? URL.createObjectURL(selectedImage)
//               : authUser?.profilePic || assets.logo_icon
//           }
//           alt="Profile"
//           className="max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 object-cover"
//         />
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;


