// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { compareTwoStrings } from "string-similarity";
import { isEmpty, isNull, lowerCase } from "lodash";

type Clipping = {
  title: string;
  author: string;
  location: string;
  body: string;
  date: string;
};

type CleanedClipping = {
  title: string;
  author: string;
  clippings: Array<string>;
  lastHighlightedDate: string;
};

type ClippingWithCover = {
  title: string;
  author: string;
  clippings: Array<string>;
  coverImage: any;
  lastHighlightedDate: string;
};

type Data = {
  clippings: Array<Clipping>;
  cleanedClippings: Array<ClippingWithCover>;
};

const getHighlightedContent = (slug: string) => {
  if (slug) {
    const [, ...rest] = slug.split(":");
    return slug.split(":")[2].slice(2);
  }
  return "";
};

const getTitleAndAuthor = (slug: string) => {
  const title = slug.split("(")[0].trim();
  if (slug.split("(").length <= 1) {
    return { title, author: "" };
  } else {
    const author = slug.split("(")[1].split(")")[0];
    return {
      title,
      author,
    };
  }
};

const convertClippingsArrayToObject = (clippings: Array<Clipping>) => {
  return clippings.reduce((acc: Array<CleanedClipping>, clipping: Clipping) => {
    if (acc.find((a) => a.title === clipping.title)) {
      return acc.map((a) => {
        if (a.title === clipping.title) {
          return {
            ...a,
            clippings: [...a.clippings, clipping.body],
          };
        }
        return a;
      });
    }
    return [
      ...acc,
      {
        title: clipping.title,
        author: clipping.author,
        clippings: [clipping.body],
        lastHighlightedDate: clipping.date,
      },
    ];
  }, []);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { includeCoverImage, clippingsFile } = req.body;

  const dateRegex = /([0-9]* [A-Z])\w+ [0-9]{4}/;

  const clippingsArray = clippingsFile
    .split("==========")
    .map((s: string) => {
      const { title, author } = getTitleAndAuthor(s.split("\n")[1]);

      const content = s.split("\n")[4];
      const locationInfo = s.split("\n")[2];
      const locationRegEx = /location ([0-9])\w+-([0-9])\w+/;

      const locationString =
        !isEmpty(locationInfo) &&
        !isNull(locationInfo) &&
        !isEmpty(locationInfo.match(locationRegEx))
          ? // @ts-ignore
            locationInfo?.match(locationRegEx)[0]
          : "";
      const dateString =
        !isEmpty(locationInfo) &&
        !isNull(locationInfo) &&
        !isEmpty(locationInfo.match(dateRegex))
          ? // @ts-ignore
            locationInfo?.match(dateRegex)[0]
          : "";

      const contentWithLocation = !isEmpty(content)
        ? `${content} \n\n ${locationString} | Added on ${dateString}`
        : "";
      return {
        title,
        author,
        location: s.split("|")[1],
        body: contentWithLocation,
        date: dateString,
      };
    })
    .filter((c: Clipping) => !!c.body && c.body !== "");

  const cleanedClippings = await convertClippingsArrayToObject(clippingsArray);

  let clippingsWithCover = [];

  for await (const { title, author, clippings } of cleanedClippings) {
    const googleBooksResponse = includeCoverImage
      ? await axios({
          url: `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(
            lowerCase(title)
          )}`,
          method: "get",
        })
      : undefined;

    const coverImage =
      includeCoverImage && googleBooksResponse?.data.totalItems > 0
        ? googleBooksResponse?.data.items[0].volumeInfo.imageLinks
        : undefined;
    const authorFromGoogleBooks =
      includeCoverImage && googleBooksResponse?.data.totalItems > 0
        ? googleBooksResponse?.data.items[0].volumeInfo.authors[0]
        : "";
    const authorSimilarity = compareTwoStrings(
      lowerCase(author),
      lowerCase(authorFromGoogleBooks)
    );

    const finalAuthorName: string =
      authorSimilarity >= 0.4 || isEmpty(author)
        ? authorFromGoogleBooks
        : author;

    const clippingsForBook = clippingsArray.filter(
      (c: Clipping) => c.title === title
    );
    clippingsWithCover.push({
      title,
      clippings,
      author: finalAuthorName,
      coverImage,
      lastHighlightedDate: clippingsForBook[clippingsForBook.length - 1].date,
    });
  }

  res.status(200).json({
    clippings: clippingsArray,
    cleanedClippings: clippingsWithCover,
  });
}
