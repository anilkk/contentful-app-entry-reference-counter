import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableHead, TableCell, TableRow, Grid, GridItem, Heading } from '@contentful/forma-36-react-components';
import { PageExtensionSDK } from '@contentful/app-sdk';

interface PageProps {
  sdk: PageExtensionSDK;
}

interface MyCustomEntry {
  referenceCount: Number;
  fieldName: Object;
  id: String
}

const ReferenceCountDiff = function (entryA: any, entryB: any) {
  return entryB.referenceCount - entryA.referenceCount;
}

const Page = (props: PageProps) => {
  const [myData, setMyData] = useState([]);

  useEffect(() => {
    (async () => {
      const refEntries = [];
      const entries = await props.sdk.space.getEntries({ limit: 10 });

      // @ts-ignore 
      let myEntries:[MyCustomEntry] = entries.items.map(entry => {
        // @ts-ignore 
        const fieldName = entry.fields.title ? entry.fields.title : (entry.fields.name ? entry.fields.name : {'en-US': "Untitled"});
        // @ts-ignore  
        return { id: entry.sys.id, fieldName };
      });
      
      for (let index = 0; index < myEntries.length; index++) {
        let entryId = myEntries[index].id;
        let referenceByEntry = await props.sdk.space.getEntries({ links_to_entry: entryId });
        refEntries.push(referenceByEntry);

        // @ts-ignore 
        myEntries[index].referenceCount = referenceByEntry.total;
      }
      
      myEntries = myEntries.sort(ReferenceCountDiff);
      
      // @ts-ignore 
      setMyData(myEntries);
    })();
  }, []);

  return (<div className="f36-margin--m">
    <Heading >
     Entry and it's number of references
    </Heading>
    <Grid columns="650px" rowGap="spacingM" columnGap="spacingM">
      <GridItem>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Entry name</TableCell>
              <TableCell>Number of references</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {myData.length && myData.map(({ referenceCount, fieldName }, index) => (
              <TableRow key={`${fieldName}-${index}`}>
                <TableCell>{fieldName['en-US']}</TableCell>
                <TableCell>{referenceCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </GridItem>
    </Grid>
  </div>);
};

export default Page;
