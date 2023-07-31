import { useQuery } from "@apollo/client";
import React from "react";
import Loading from "../../../../components/Loading";
import UserProfile from "../../../../components/UserProfile";
import { UserBoardsQuery } from "../../../../lib/query";

import { signOut, useSession } from "next-auth/react";
import UserBoardsList from "../../../../components/UserBoardsList";
import CreateDialog from "../../../../components/CreateDialog";
import Container from "../../../../components/Container";
import useMediaQuery from "../../../../hooks/useMediaQuery";
import Button from "../../../../components/Button";
import { useRouter } from "next/router";
const BoardListPage = () => {
  // const { data: userId } = useQuery(UserIdQuery, {
  //   variables: {
  //     userId: user?.email,
  //   },
  // });

  const router= useRouter();
  const { userId } = router.query;

  const isNotMobile = useMediaQuery("(min-width: 768px)");

  const { data: session } = useSession();

  const { data, loading } = useQuery(UserBoardsQuery, {
    variables: {
      userId,
    },
  });
  console.log(data);

  return (
    <Container>
      <UserProfile />

      {loading && (
        <div className="flex justify-center pt-4">
          <Loading />
        </div>
      )}
      <section className="mx-auto max-w-7xl mt-4 flex flex-col  ">
        <div className="ml-auto flex items-center gap-x-2">
          {!isNotMobile ? (
            <Button text="Logout" handleClick={() => signOut()} />
          ) : null}
          {session?.user?.id === userId ? <CreateDialog /> : null}
          
        </div>
        <UserBoardsList userBoards={data?.userBoards} />
      </section>
    </Container>
  );
};

export default BoardListPage;
