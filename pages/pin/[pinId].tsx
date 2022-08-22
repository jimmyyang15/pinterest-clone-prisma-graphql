import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { SinglePinQuery, UserIdQuery, UserSavedPins } from '../../lib/query';
import { HiArrowLeft, HiDotsHorizontal, HiDownload, HiLink } from 'react-icons/hi'
import { IComment, IPin } from '../../interface';
import Image from 'next/image';
import { MdExpandMore } from 'react-icons/md'
import { v4 as uuidv4 } from 'uuid'
import Loading from '../../components/Loading';
import { useUser } from '@auth0/nextjs-auth0';
import { createCommentMutation,  savePinMutation,deleteSaveMutation } from '../../lib/mutation';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import apolloClient  from '../../lib/apollo'



interface IProps {
  comment:IComment
}

const Comment = ({ comment }: IProps) => {
  
  
  return (
    <div key={uuidv4()} className={`flex gap-x-2 items-center`}>
      <Image className='rounded-full' width={40} height={40} alt="user-picture" src={comment?.user?.image || "https://upload.wikimedia.org/wikipedia/commons/b/bc/Unknown_person.jpg"} />
      <div>
        <p className='text-gray-500'>{comment.user.email}</p>
        <p className='text-lg'>{comment.content}</p>
      </div>
    </div>
  )
}

const PinDetail = () => {
    const [expandComment,setExpandComment] = useState(false)
    const router = useRouter();
    const { pinId } = router.query;
    const { user } = useUser();


    const [contentFocus,setContentFocus] = useState<boolean>(false);
    const [content,setContent] = useState<string>("");

    const { reset,handleSubmit } = useForm();

    const [saveMutation,{ error:saveError }] = useMutation(savePinMutation);
    const [deleteSave] = useMutation(deleteSaveMutation)
    const [createComment] = useMutation(createCommentMutation,{
      refetchQueries:[SinglePinQuery]
    })

    const { data:userId } = useQuery(UserIdQuery,{
      variables:{
          userId:user?.email
      }
    });


    const { data,loading,error } = useQuery(SinglePinQuery,{
        variables:{
            pinId
        }
    });


    const { pin }: { pin:IPin } = data || {};

    const savePin = async () => {
      const variables = { 
        userId:userId?.user.id,
        pinId
      }

      const { data:{ userSaved } } = await apolloClient.query({
        query:UserSavedPins,
        variables:{
          userId:userId?.user.id
        }
      });
      const alreadySaved = userSaved.find((pin:any)=>pin.pinId === pinId);
      console.log(alreadySaved)
      if(alreadySaved) {
        try {
          toast.promise(deleteSave({ variables:{ saveId:alreadySaved.id } }), {
            loading: 'Removing pin from save...',
            success: 'Pin successfully removed from your saved!🎉',
            error: `Something went wrong 😥 Please try again -  ${saveError?.message}`,
          })
        } catch(err) {
          console.log(err)
        }
      } else {
          try {
            toast.promise(saveMutation({ variables }), {
              loading: 'Saving pin..',
              success: 'Pin successfully saved!🎉',
              error: `Something went wrong 😥 Please try again -  ${saveError?.message}`,
            })
      
          } catch (error) {
            console.error(error)
          }
      }

   
    }

    const addComment = async() => {
      const variables = {
        content,
        userId:userId?.user.id,
        pinId
      }
      try {
        await createComment({ variables })
      reset()

      } catch (error) {
        console.error(error)
      }


    }

    console.log(userId)

    if(loading) return (
      <div className='flex justify-center py-4'>
        <Loading />
      </div>  
    )
    if(error) return <p>{error.message}</p>
  return (
    <main className='max-w-7xl mx-auto my-8 p-4'>
      <div className='flex gap-x-8'>
        <HiArrowLeft className="text-3xl cursor-pointer hidden md:block " onClick={()=>router.back()} />
        <section className='shadow-lg rounded-3xl w-full flex flex-col md:flex-row'>
          <div className=' relative  '>
            <Image src={pin.imageUrl} alt="image" width={700} height={650} objectFit="cover" className="rounded-3xl"   />

          </div>
          <div className="p-8 w-full">
            <nav className='flex justify-between  items-center  '>
              <div className='space-x-6 flex text-2xl'>
                <HiDotsHorizontal />
                <HiDownload />
                <HiLink />
              </div>
              <div className='ml-auto'>
                <button onClick={()=>{
                  user ? savePin() : router.push("/api/auth/login") 
                }} className='bg-[#E60023] rounded-full px-4 py-2 text-lg font-semibold text-white'>Save</button>
              </div>
            </nav>
            <div className='mt-4 space-y-3'>
              <h1 className='text-2xl md:text-4xl font-bold'>{pin.title}</h1>
              <p className='text-sm md:text-base'>{pin.description}</p>
              <div className='flex gap-x-3'>
                <Image alt="user-avatar" className='rounded-full' src={data?.pin.user.image || "https://upload.wikimedia.org/wikipedia/commons/b/bc/Unknown_person.jpg"} width={40} height={40}   />
                <p>{data?.pin.user.email}</p>
              </div>
              <div>
                <div className='flex items-center gap-x-2 font-semibold text-xl'>
                  <span >
                    {pin.comments.length === 0 ? "" :pin.comments.length } Comments

                  </span>
                  <MdExpandMore className="text-4xl animate-bounce cursor-pointer" onClick={()=>setExpandComment((prev)=>!prev)} />
              </div>
              {expandComment && (
                <div className='space-y-2 my-2'>
                  {pin.comments.map((comment:IComment)=>(
                    <Comment key={uuidv4()} comment={comment} />
                  ))}
                </div>
              )}

              <form className='flex flex-col' onSubmit={handleSubmit(addComment)} >
                <div className='flex gap-x-4 w-full items-center '>
                  {user && (
                    <Image src={user?.picture || ""} width={40} height={40} className="rounded-full mr-4" alt={"avatar"} />

                  )}
                  <input
                    onFocus={()=>setContentFocus(true)}
                    onChange={(e)=>setContent(e.target.value)}
                    type="text"
                    className='w-full p-3 outline-none border-gray-200 rounded-full border'
                    placeholder={`${user ? "Add a comment" : "Please login first to comment"}`}
                    disabled={user===undefined}
                  />
                  
                </div>
                    
                {contentFocus && (
                  <div className=' self-end gap-x-2 flex items-center  mt-2'>
                    <button className='px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-full' onClick={()=>{
                      setContentFocus(false)
                      reset()
                    }}>Cancel</button>
                    <button className='font-semibold bg-[#E60023] text-white rounded-full px-4 py-2' disabled={content.length <= 0} >Done</button>
                  </div>
                )}
         
              </form>
        
               

              </div>
            </div>
          </div>
          
        </section>
      </div>
    </main>
  )
}

export default PinDetail