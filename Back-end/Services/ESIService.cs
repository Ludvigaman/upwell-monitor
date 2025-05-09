﻿using Back_end.Models;
using ESI.NET;
using ESI.NET.Models.Assets;
using ESI.NET.Models.Corporation;

namespace Back_end.Services
{
    public class ESIService
    {
        private readonly IEsiClient _client;
        private List<Item> _allItems = new List<Item>();
        private List<Item> _fuelBlocks = new List<Item>();
        private List<StructureItem> _returnStructures = new List<StructureItem>();

        private List<Structure> structureList = new List<Structure>();

        public ESIService(IEsiClient client)
        {
            _client = client;
        }

        public async Task<List<StructureItem>> GetStructureIdList()
        {
            var now = DateTime.Now;

            var fuelBlockIds = new List<long>
            {
                4051, //Nitrogen Fuel Block
                4312, //Oxygen Fuel Block
                4247, //Helium Fuel Block
                4246  //Hyrdrogen Fuel Block
            };

            var location_flag = "StructureFuel";

            // ------ Upwell structures ------
            var structureResponse = await _client.Corporation.Structures();
            structureList.AddRange(structureResponse.Data);

            for (var i = 2; i <= structureResponse.Pages; i++)
            {
                var itemPage = await _client.Corporation.Structures(i);
                structureList.AddRange(itemPage.Data);
            }

            structureList.ForEach(structure =>
            {
                var services = new List<string>();
                foreach (var service in structure.Services)
                {
                    services.Add(service.Name);
                }

                var struc = new StructureItem
                {
                    FuelBlocksInFuelBay = 0,
                    FuelExpires = structure.FuelExpires,
                    Id = structure.StructureId,
                    Name = structure.Name,
                    TypeId = structure.TypeId,
                    Services = services
                };
                _returnStructures.Add(struc);
            });

            //Load page 1
            var assetResponse = await _client.Assets.ForCorporation();

            _allItems.AddRange(assetResponse.Data);

            for(var i = 2; i <= assetResponse.Pages; i++) {
                var itemPage = await _client.Assets.ForCorporation(i);
                _allItems.AddRange(itemPage.Data);
            }

            _fuelBlocks = _allItems
                .Where(item => fuelBlockIds.Contains(item.TypeId))
                .ToList();

            /* -------- Handle fuel bay ------------ */

            var fuelBlocksInFuelBays = _fuelBlocks.Where(item => item.LocationFlag == location_flag).ToList();

            var fuelBlockFuelBayQuantities = fuelBlocksInFuelBays
                .GroupBy(item => item.LocationId)
                .Select(group => new
                {
                    LocationId = group.Key,
                    TotalQuantity = group.Sum(item => item.Quantity)
                })
                .ToList();


            _returnStructures.ForEach(structure =>
            {

                var fuelBlocks = fuelBlockFuelBayQuantities.FirstOrDefault(fb => fb.LocationId == structure.Id);
                structure.FuelBlocksInFuelBay = fuelBlocks?.TotalQuantity ?? 0;

                //Calculate how many days of fuel is left based on the current fuel bay quantity
                //Get days left until exiration date

                TimeSpan difference = structure.FuelExpires - now;
                int daysUntilExpiration = difference.Days;

                double consumption = structure.FuelBlocksInFuelBay / daysUntilExpiration;
                structure.FuelBlocksPerDay = (int)Math.Round(consumption);

            });

            return _returnStructures;

        }
    }
}
