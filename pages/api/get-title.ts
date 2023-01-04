import type { NextApiRequest, NextApiResponse } from "next";
import { Client } from "@notionhq/client";

type Data = {
  queryTitle: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log("got here");
  const { notionApiAuthToken, notionDatabaseID, title } = req.body;
  const notion = new Client({
    auth: notionApiAuthToken,
  });
  const queryTitle = await notion.databases.query({
    database_id: notionDatabaseID,
    filter: {
      or: [
        {
          property: "Title",
          rich_text: {
            contains: title,
          },
        },
      ],
    },
  });
  res.status(200).json({
    queryTitle,
  });
}
