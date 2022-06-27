#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Jun 21 15:01:24 2022

@author: Roberta Baggio, J.B. Filippi, Damien Grandi
Challenge Dataviz 28/06/2022  Equipe Omatidie
# Préparation des données

"""

import pandas as pd
from netCDF4 import Dataset
import numpy as np
import math
import matplotlib.pyplot as plt
from scipy import interpolate
refProjectionFile = "/Users/filippi_j/data/2022/firecaster_surface_data/refProjection.nc"
import json


def loadFromOpenDataCorsica():
    print("Chargement des données sur Opendata.Corsica")
    dtt = pd.read_csv ("https://www.data.corsica/explore/dataset/demande-de-valeurs-foncieres-geolocalisee/download/?format=csv&timezone=Europe/Paris&lang=fr&use_labels_for_header=true&csv_separator=%3B", sep=";")
    dtt.columns = dtt.columns.str.replace(' ','_')
    dtt.columns = dtt.columns.str.lower()
    dtt.columns = dtt.columns.str.replace(r'[èéêë]', 'e')
    dtt.columns = dtt.columns.str.replace(r'[àâ]', 'a')
    dtt.code_insee_de_la_commune=dtt.code_insee_de_la_commune.astype("str")
    dtt["SURF"]=dtt.surface_reelle_du_bati
    dtt.surface_carrez_du_lot_1=dtt.surface_carrez_du_lot_1.where(dtt.surface_carrez_du_lot_1.notna(),0)
    dtt.surface_carrez_du_lot_2=dtt.surface_carrez_du_lot_2.where(dtt.surface_carrez_du_lot_2.notna(),0)
    dtt.surface_carrez_du_lot_3=dtt.surface_carrez_du_lot_3.where(dtt.surface_carrez_du_lot_3.notna(),0)
    dtt.surface_carrez_du_lot_4=dtt.surface_carrez_du_lot_4.where(dtt.surface_carrez_du_lot_4.notna(),0)
    dtt.lot5_surface_carrez=dtt.surface_carrez_du_lot_4.where(dtt.surface_carrez_du_lot_4.notna(),0)
    
    dtt.SURF=dtt.SURF.where(dtt.SURF>=dtt.surface_carrez_du_lot_1+dtt.surface_carrez_du_lot_2+dtt.surface_carrez_du_lot_3+dtt.surface_carrez_du_lot_4+dtt.lot5_surface_carrez,dtt.surface_carrez_du_lot_1+dtt.surface_carrez_du_lot_2+dtt.surface_carrez_du_lot_3+dtt.surface_carrez_du_lot_4+dtt.lot5_surface_carrez)
    dtt.SURF=dtt.SURF.where(dtt.SURF.notna(),dtt.surface_du_terrain)
    dtt.SURF=dtt.SURF.where(dtt.SURF!=0,dtt.surface_du_terrain)
    dtt=dtt[dtt.SURF>=20]
    dtt["PRIX_m2"]=dtt.valeur_fonciere/dtt.SURF
        
    return dtt

def locationtoCSV(slat,slng,size,patheout,write=False):
    buffer = size
    fcdf = Dataset(refProjectionFile, 'r')
    
    lngs = np.array(fcdf.variables["lng"][:])
    lats = np.array(fcdf.variables["lat"][:])
    altitude = np.array(fcdf.variables["ZS"][:])
    
    ni, nj = np.shape(lngs)
    distances = {}
    LatLonStr = "%f,%f"%(slat,slng) 
    print(LatLonStr)
    for i in range(ni):
        for j in range(nj):
            dist = int(100000 * math.sqrt((slat-lats[i, j])**2+(slng-lngs[i, j])**2))
            distances[dist] = (i, j)

    nearest = distances[sorted(distances.keys())[0]]
    
    z = altitude[nearest[0]-buffer:nearest[0]+buffer, nearest[1]-buffer:nearest[1]+buffer]
    lon= lngs[nearest[0]-buffer:nearest[0]+buffer, nearest[1]-buffer:nearest[1]+buffer]
    lat = lats[nearest[0]-buffer:nearest[0]+buffer, nearest[1]-buffer:nearest[1]+buffer]
        
    if(write):
        pd.DataFrame(z).to_csv(patheout)
    
    return z, lat,lon

def genSubsetValue(bounds, df, start_date, end_date) :
    
    
    mask = (df['date_mutation'] >  pd.to_datetime(start_date)) & (df['date_mutation'] <=  pd.to_datetime(end_date))
    fileterd = df.loc[mask]
    mask = (df['latitude'] >  bounds[0]) & (df['latitude'] <=  bounds[2])
    fileterd = fileterd.loc[mask]
    mask = (df['longitude'] >  bounds[1]) & (df['longitude'] <=  bounds[3])
    fileterd = fileterd.loc[mask]
    mask = (df['PRIX_m2'] >  10) & (df['PRIX_m2'] <=  30000)
    fileterd = fileterd.loc[mask]
  
    return fileterd
    
 
def makeAreaValues(df,bounds):
    x = np.array(df['longitude'] )
    y = np.array(df['latitude'] )
    z = np.array(df["PRIX_m2"])
    
    
    
    X = np.linspace(bounds[1], bounds[3],num=120)
    Y = np.linspace(bounds[0], bounds[2],num=120)
    
    X, Y = np.meshgrid(X, Y)  # 2D grid for interpolation
 
    interp = interpolate.griddata((x, y), z, (X, Y), method='linear')
    
    Z = interp
    return Z
 
def compiledata(df):
    df['date_mutation'] = pd.to_datetime(df['date_mutation'])
    dextract = df[["latitude","longitude","PRIX_m2","date_mutation","valeur_fonciere","SURF",]]
    
    

precomputed=True

df = {}
if precomputed:
    df = pd.read_csv (r'scatterSetFoncier.csv')
else:
    df =  loadFromOpenDataCorsica()

df['date_mutation'] = pd.to_datetime(df['date_mutation'])

areas = {}
areas["ajaccio41d9189x8d7924"] = (41.9189, 8.7924)
areas["balagne42d5494x8d759"] = (42.5494, 8.759)
areas["bastia42d6935x9d4244"] = (42.6935, 9.4244)
areas["portovek41d587x9d275"] = (41.667, 9.275)
areas["corte42d304x9d156"] = (42.304, 9.156)

#dates =('2017-1-1', '2018-1-1', '2019-1-1', '2020-1-1','2021-1-1', '2022-1-1',)
dates =('2017-1-1','2022-1-1')

for area in areas.keys():
        z,lats,lngs = locationtoCSV(areas[area][0], areas[area][1],50,"%s.csv"%area)
        bounds =(lats[0,0],lngs[0,0],lats[-1,-1],lngs[-1,-1])
   
        
        for i,datestr in enumerate(dates[:-1]):
            selectedPoints = genSubsetValue(bounds, df, datestr, dates[i+1])
     
            toto = []
            print(area,"max",selectedPoints['PRIX_m2'].max()," millions ",selectedPoints['valeur_fonciere'].sum()/1000000," piscines ",selectedPoints['valeur_fonciere'].sum()/(2500*2*1000))
            for index, row in selectedPoints.iterrows():
                
                mamaison={}
                mamaison["lat"] = row['latitude']
                mamaison["lng"] = row['longitude']
                mamaison["prixM2"] = row['PRIX_m2']
                mamaison["prix"] = row['valeur_fonciere']
                toto.append(mamaison)
               
            with open('%s.json'%area, 'w') as outfile:
                json.dump(toto, outfile,indent=4, sort_keys=True, ensure_ascii=False)
            
 