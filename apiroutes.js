/*
 * @ApiRoutes.js
 */
"use strict";


let express = require('express'),
    ApiRoutes = express.Router();

const { Client } = require('pg');


/*
 *  routes
 */

ApiRoutes.get('/add-sync-trigger', async (req, res) => {
    let schemaa = process.env.SCHEMA_A;
    let schemab = process.env.SCHEMA_B;
    console.log('schemaa :: ' +  schemaa);

    let queryFunkA = 'CREATE OR REPLACE FUNCTION ' + schemaa + '.update_contact_phone() RETURNS trigger LANGUAGE \'plpgsql\' \
                        COST 100 \
                        VOLATILE NOT LEAKPROOF \
                    AS $BODY$ \
                     DECLARE \
                      oldxmlbinary varchar; \
                     BEGIN \
                         oldxmlbinary := get_xmlbinary(); \
                        SET LOCAL xmlbinary TO \'base64\'; \
                         IF new.phone != old.phone THEN \
                              UPDATE '  + schemab + '.contact \
                              SET phone = new.phone \
                              WHERE email = old.email; \
                         END IF; \
                         EXECUTE \'SET LOCAL xmlbinary TO \' || oldxmlbinary; \
                         RETURN NEW; \
                     END; \
                     $BODY$;';

    let  queryTrigA = 'CREATE TRIGGER ' + schemaa + '_update_contact \
                         AFTER UPDATE \
                         ON ' + schemaa + '.contact \
                         FOR EACH ROW EXECUTE PROCEDURE ' + schemaa + '.update_contact_phone();';

	let dropTriggerA = 'DROP TRIGGER IF EXISTS ' + schemaa + '_update_contact ON ' + schemaa + '.contact;';

     let queryFunkB = 'CREATE OR REPLACE FUNCTION ' + schemab + '.update_contact_phone() \
                         RETURNS trigger \
                         LANGUAGE \'plpgsql\' \
                         COST 100 \
                         VOLATILE NOT LEAKPROOF \
                     AS $BODY$ \
                      DECLARE \
                       oldxmlbinary varchar; \
                      BEGIN \
                          oldxmlbinary := get_xmlbinary(); \
                         SET LOCAL xmlbinary TO \'base64\'; \
                          IF new.phone != old.phone THEN \
                               UPDATE ' + schemaa + '.contact \
                               SET phone = new.phone \
                               WHERE email = old.email; \
                          END IF; \
                          EXECUTE \'SET LOCAL xmlbinary TO \' || oldxmlbinary; \
                          RETURN NEW; \
                      END; \
                      $BODY$;';

     let  queryTrigB = 'CREATE TRIGGER ' + schemab + '_update_contact \
                          AFTER UPDATE \
                          ON ' + schemab + '.contact \
                          FOR EACH ROW \
                          EXECUTE PROCEDURE ' + schemab + '.update_contact_phone();';

	let dropTriggerB = 'DROP TRIGGER IF EXISTS ' + schemab + '_update_contact ON ' + schemab + '.contact;';



    let currclient = new Client({
                connectionString: process.env.DATABASE_URL,
                ssl: {
                    rejectUnauthorized: false
                  }
            });

            currclient.connect();

            currclient.query(queryFunkA, (err, ress) => {
                if (err){
                    console.log('err 1');
                    console.log(err);
                    // reject();
                }
                console.log(ress);
				currclient.query(dropTriggerA, (err, ress) => {
	                currclient.query(queryTrigA, (errr, resss) => {
	                    if (errr){
	                        console.log('err 2');
	                        console.log(errr);
	                        // reject();
	                    }
	                    console.log(resss);
	                    currclient.query(queryFunkB, (errrr, ressss) => {
	                        if (errrr){
	                            console.log('err 3');
	                            console.log(errrr);
	                            // reject();
	                        }
	                        console.log(ressss);
							currclient.query(dropTriggerB, (errrr, ressss) => {
		                        currclient.query(queryTrigB, (errrrr, resssss) => {
		                            if (errr){
		                                console.log('err 4');
		                                console.log(errrrr);
		                            }

		                            console.log(resssss);

		                            res.sendStatus(200);
		                        });
							});
	                    });
	                });
				});
            });
});

/*
 * export
 */
module.exports = ApiRoutes;
