namespace Back_end.Models
{
    public class StructureItem
    {
        public DateTime FuelExpires { get; set; }
        public long Id { get; set; }
        public string Name { get; set; }
        public long FuelBlocksInFuelBay { get; set; }
        public long FuelBlocksPerDay { get; set; }
        public long TypeId { get; set; }
    }
}
