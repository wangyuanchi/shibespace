import { Pagination, Typography } from "@mui/material";

import { Thread } from "../types/shibespaceAPI";
import ThreadPreview from "./ThreadPreview";

interface Props {
  threads: Thread[];
  threadsTotalCount: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const Threads: React.FC<Props> = ({
  threads,
  threadsTotalCount,
  page,
  setPage,
}) => {
  const mapThreadsToElements = (threads: Thread[]): JSX.Element[] => {
    return threads.map((t) => <ThreadPreview key={t.id} {...t} />);
  };

  // The default limit query is 10 based on shibespaceAPI
  // Also, this allows the page query to always be valid.
  const totalPageCount = Math.ceil(threadsTotalCount / 10);

  return (
    <>
      {threads.length ? (
        <>
          {mapThreadsToElements(threads)}
          <Pagination
            count={totalPageCount}
            page={page} // So that the page remains as previously set
            hidePrevButton={true}
            hideNextButton={true}
            sx={{ mb: 10 }}
            onChange={(_event, value: number) => setPage(value)}
          />
        </>
      ) : (
        <Typography variant="body1">
          Uh-oh! You tried to find a thread that doesn't exist.
        </Typography>
      )}
    </>
  );
};

export default Threads;
