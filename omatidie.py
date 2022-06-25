#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Jun 21 15:01:24 2022

@author: filippi_j
"""

import pandas as pd

df = pd.read_csv (r'/Users/filippi_j/Documents/workspace/jsPlayground/Ommatidie/scatterSetFoncier.csv')
print (df)
for col in df.columns:
    print(col)
df['date_mutation'] = pd.to_datetime(df['date_mutation'])

#ajouter une colonne région + 1 colonne semestre

#dextract = df[["latitude","longitude","PRIX_m2","date_mutation","valeur_fonciere","SURF",]]


#dextract.to_csv('/Users/filippi_j/Documents/workspace/jsPlayground/Ommatidie/scatterSetFoncier.csv')  