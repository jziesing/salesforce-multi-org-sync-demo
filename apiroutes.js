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

ApiRoutes.get('/add-sync-trigger/:schemaa/:schemab', async (req, res) => {
    let schemaa = req.params.schemaa;
    let schemab = req.params.schemab;
    console.log('schemaa :: ' +  schemaa);

    let queryFunkA = 'DROP FUNCTION IF EXISTS ' + schemaa + '.' + schemaa + '_update_contact_phone(); CREATE FUNCTION ' + schemaa + '.' + schemaa + '_update_contact_phone() \
                        RETURNS trigger \
                        LANGUAGE \'plpgsql\' \
                        COST 100 \
                        VOLATILE NOT LEAKPROOF \
                    AS $BODY$ \
                     DECLARE \
                      oldxmlbinary varchar; \
                     BEGIN \
                         -- save old value \
                         oldxmlbinary := get_xmlbinary(); \
                         -- change value base64 to ensure writing to _trigger_log is enabled \
                        SET LOCAL xmlbinary TO \'base64\'; \
                         IF new.phone != old.phone THEN \
                              UPDATE schemab.contact \
                              SET phone = new.phone \
                              WHERE email = old.email; \
                         END IF; \
                         -- Reset the value \
                         EXECUTE \'SET LOCAL xmlbinary TO \' || oldxmlbinary; \
                         RETURN NEW; \
                     END; \
                     $BODY$;';

    let  queryTrigA = 'CREATE OR REPLACE TRIGGER ' + schemaa + '_update_contact \
                         AFTER UPDATE \
                         ON ' + schemaa + '.contact \
                         FOR EACH ROW \
                         EXECUTE PROCEDURE ' + schemaa + '.' + schemaa + '_update_contact_phone();';

     let queryFunkB = 'DROP FUNCTION IF EXISTS ' + schemab + '.' + schemab + '_update_contact_phone(); CREATE FUNCTION ' + schemab + '.' + schemab + '_update_contact_phone() \
                         RETURNS trigger \
                         LANGUAGE \'plpgsql\' \
                         COST 100 \
                         VOLATILE NOT LEAKPROOF \
                     AS $BODY$ \
                      DECLARE \
                       oldxmlbinary varchar; \
                      BEGIN \
                          -- save old value \
                          oldxmlbinary := get_xmlbinary(); \
                          -- change value base64 to ensure writing to _trigger_log is enabled \
                         SET LOCAL xmlbinary TO \'base64\'; \
                          IF new.phone != old.phone THEN \
                               UPDATE schemaa.contact \
                               SET phone = new.phone \
                               WHERE email = old.email; \
                          END IF; \
                          -- Reset the value \
                          EXECUTE \'SET LOCAL xmlbinary TO \' || oldxmlbinary; \
                          RETURN NEW; \
                      END; \
                      $BODY$;';

     let  queryTrigB = 'CREATE OR REPLACE TRIGGER ' + schemab + '_update_contact \
                          AFTER UPDATE \
                          ON ' + schemab + '.contact \
                          FOR EACH ROW \
                          EXECUTE PROCEDURE ' + schemab + '.' + schemab + '_update_contact_phone();';



    let currclient = new Client({
                connectionString: process.env.DATABASE_URL,
                ssl: {
                    rejectUnauthorized: false
                  }
            });

            currclient.connect();

            currclient.query(queryFunkA, (err, ress) => {
                if (err){
                    // reject();
                }
                console.log(ressss);
                currclient.query(queryTrigA, (errr, resss) => {
                    if (errr){
                        console.log(errr);
                        // reject();
                    }
                    console.log(ress);
                    currclient.query(queryFunkB, (errrr, ressss) => {
                        if (errrr){
                            console.log(errrr);
                            // reject();
                        }
                        console.log(ressss);
                        currclient.query(queryTrigB, (errrrr, resssss) => {
                            if (errr){
                                console.log(errrrr);
                            }

                            console.log(resssss);

                            res.sendStatus(200);
                        });
                    });
                });
            });
});

// get things
// ApiRoutes.post("/make/things", PubMakeThings.MakeThingsPost);
/*
 * export
 */
module.exports = ApiRoutes;
