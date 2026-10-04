import json
from loguru import logger
# from kafka import KafkaProducer  # In production

class KafkaStreamingClient:
    """
    Event-Driven Streaming Architecture (Phase 2).
    Simulates an Apache Kafka or Redpanda producer for real-time tender ingestion.
    """
    def __init__(self):
        self.bootstrap_servers = ["localhost:9092"]
        # self.producer = KafkaProducer(bootstrap_servers=self.bootstrap_servers, value_serializer=lambda v: json.dumps(v).encode('utf-8'))
        self.producer = None # Mocked for hackathon
        
    def fire_tender_event(self, tender_data: dict):
        """
        Fires an asynchronous event when a massive infrastructure tender is posted on CPPP.
        The LMIS consumes it in milliseconds to recalculate the CDI nationwide.
        """
        logger.info(f"[KAFKA-PRODUCER] Firing 'TENDER_PUBLISHED' event to topic 'msde.tenders.live': {tender_data['tender_title']}")
        # self.producer.send('msde.tenders.live', tender_data)
        
    def fire_mobility_event(self, migrant_data: dict):
        """
        Fires when e-Shram registers a new mass mobility corridor.
        """
        logger.info(f"[KAFKA-PRODUCER] Firing 'MIGRANT_MOBILITY' event to topic 'msde.eshram.live': {migrant_data['origin_state']}")
        # self.producer.send('msde.eshram.live', migrant_data)

kafka_client = KafkaStreamingClient()
