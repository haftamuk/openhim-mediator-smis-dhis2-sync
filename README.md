# SMIS-and-DHIS2-KPI-data-sync

   This mediator helps to synchronize KPI value from DHIS2. Two methods are used in order to synchronise KPI values; (1) User triggered sync for a single KPI and (2) OpenHIM triggered sync. KPI in this work is analogues to indicator in DHIS2, which is defined as expressions which can be calculated and presented as a result.

   Representation of KPI values returned from DHIS2 could differ based on the parameters we used in our request. Three dimensions(as they are referred to in DHIS2 developer documentation) are used to filter certain KPIs and their values. Those are data dimensions (include data element, indicator, etc …), period and organization unit.   
explore https://docs.dhis2.org/2.28/en/developer/html/webapi_analytics.html for more detail

   The DHIS2 API has many filtering options and parameters you can utilize to perform analytics, but this mediator uses only the required parameters(dimension parameter). Therefore requests to DHIS2 are sent in the following way  

https://play.dhis2.org/2.30/api/analytics?dimension=dx: **${req.params.dx}** &dimension=pe: **${req.params.pe}**  &dimension=ou: **${req.params.ou}**  

With three dynamic values you can pass to filter data elements.  

Once results are returned, the mediator performs certain actions on the retrieved data based on your needs.  
- SUM - Sum of all returned row values
- AVERAGE  - Average of all returned row values
- LAST  - Last element of the returned rows
- FIRST  - First element of the returned rows

SMIS should pass those flags in the request as parameters 

   The client also needs to pass other parameters:  
SMIS KPI id, SMIS work unit id and period/range.  
   The mediator uses a key-value pairs to map SMIS KPI id with DHIS2 KPI id and a csv file to map SMIS work unit id with DHIS2 Work Unit Id/s.

   The key-value file is simple plain space separated text file with the first column containing SMIS KPI id and the second column containing DHIS2 KPI id

```
SMISId,DHIS2Id
SMIS-KPI-ID1,DHIS2-KPI-ID1
SMIS-KPI-ID2,DHIS2-KPI-ID2
SMIS-KPI-ID3,DHIS2-KPI-ID3
...

```
   The CSV file is also simple plain text file with the first column of SMIS work unit id and followed by one or more comma separated list of DHIS2 orgUnit ids
```
SMISId,DHIS2Id
SMIS-workunit-id1,DHIS2OrgUnitId11;DHIS2OrgUnitId12;DHIS2OrgUnitId13;DHIS2OrgUnitId14
SMIS-workunit-id2,DHIS2OrgUnitId21;DHIS2OrgUnitId22
SMIS-workunit-id3,DHIS2OrgUnitId31
...

```
Future works
- More filter parameters
- Data approval status
