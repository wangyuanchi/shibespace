import { Pagination, Typography } from "@mui/material";

import { Comment } from "../types/shibespaceAPI";
import CommentMain from "./CommentMain";

interface Props {
  comments: Comment[];
  commentsTotalCount: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  runUpdate: () => void;
}

const Comments: React.FC<Props> = ({
  comments,
  commentsTotalCount,
  page,
  setPage,
  runUpdate,
}) => {
  // The default limit query is 10 based on shibespaceAPI
  // Also, this allows the page query to always be valid.
  const totalPageCount = Math.ceil(commentsTotalCount / 10);

  const mapCommentsToElements = (comments: Comment[]): JSX.Element[] => {
    // This check allows us to redirect the user to the second last page
    // if they delete the single last comment
    let singleLastComment = false;
    if (totalPageCount > 1 && (commentsTotalCount - 1) % 10 === 0) {
      singleLastComment = true;
    }
    return comments.map((c) => (
      <CommentMain
        key={c.id}
        {...c}
        setPage={setPage}
        runUpdate={runUpdate}
        singleLastComment={singleLastComment}
      />
    ));
  };

  return (
    <>
      {comments.length ? (
        <>
          {mapCommentsToElements(comments)}
          <Pagination
            count={totalPageCount}
            page={page} // So that the page remains as previously set
            sx={{ mt: 4, mb: 10 }}
            onChange={(_event, value: number) => setPage(value)}
          />
        </>
      ) : (
        <Typography variant="body1" mt={4}>
          Be the first to comment something!
        </Typography>
      )}
    </>
  );
};

export default Comments;
