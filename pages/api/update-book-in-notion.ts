import type { NextApiRequest, NextApiResponse } from "next";
import { Client } from "@notionhq/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const {
    notionApiAuthToken,
    notionDatabaseID,
    pageId,
    book: { title, author, aggregrateText, coverImage, lastHighlightedDate },
  } = req.body;
  console.log({ notionApiAuthToken });
  const notion = new Client({
    auth: notionApiAuthToken,
  });

  console.log({ aggregrateText });

  const iconImageURL = coverImage ? coverImage.smallThumbnail : "";

  await notion.pages.update({
    page_id: pageId,
    properties: {
      Author: {
        rich_text: [
          {
            text: {
              content: author,
            },
          },
        ],
      },
      "Last Highlighted Date": {
        rich_text: [
          {
            text: {
              content: lastHighlightedDate,
            },
          },
        ],
      },
    },
  });
  const response = await notion.blocks.children.append({
    block_id: pageId,
    children: aggregrateText.map((text: string) => ({
      object: "block",
      quote: {
        rich_text: [
          {
            text: {
              content: text,
            },
          },
        ],
      },
    })),
  });

  const coverImageURL = coverImage ? coverImage.thumbnail : "";
  res.status(200).json({
    success: true,
  });
}
