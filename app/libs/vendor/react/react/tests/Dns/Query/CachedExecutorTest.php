<?php

namespace React\Tests\Dns\Query;

use React\Dns\Query\CachedExecutor;
use React\Dns\Query\Query;
use React\Dns\Model\Message;
use React\Dns\Model\Record;
use React\Promise;

class CachedExecutorTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @covers React\Dns\Query\CachedExecutor
     * @test
     */
    public function queryShouldDelegateToDecoratedExecutor()
    {
        $executor = $this->createExecutorMock();
        $executor
            ->expects($this->once())
            ->method('query')
            ->with('8.8.8.8', $this->isInstanceOf('React\Dns\Query\Query'))
            ->will($this->returnValue($this->createPromiseMock()));

        $cache = $this->getMockBuilder('React\Dns\Query\RecordCache')
            ->disableOriginalConstructor()
            ->getMock();
        $cache
            ->expects($this->once())
            ->method('lookup')
            ->will($this->returnValue(Promise\reject()));
        $cachedExecutor = new CachedExecutor($executor, $cache);

        $query = new Query('igor.io', Message::TYPE_A, Message::CLASS_IN, 1345656451);
        $cachedExecutor->query('8.8.8.8', $query);
    }

    /**
     * @covers React\Dns\Query\CachedExecutor
     * @test
     */
    public function callingQueryTwiceShouldUseCachedResult()
    {
        $cachedRecords = array(new Record('igor.io', Message::TYPE_A, Message::CLASS_IN));

        $executor = $this->createExecutorMock();
        $executor
            ->expects($this->once())
            ->method('query')
            ->will($this->callQueryCallbackWithAddress('178.79.169.131'));

        $cache = $this->getMockBuilder('React\Dns\Query\RecordCache')
            ->disableOriginalConstructor()
            ->getMock();
        $cache
            ->expects($this->at(0))
            ->method('lookup')
            ->with($this->isInstanceOf('React\Dns\Query\Query'))
            ->will($this->returnValue(Promise\reject()));
        $cache
            ->expects($this->at(1))
            ->method('storeResponseMessage')
            ->with($this->isType('integer'), $this->isInstanceOf('React\Dns\Model\Message'));
        $cache
            ->expects($this->at(2))
            ->method('lookup')
            ->with($this->isInstanceOf('React\Dns\Query\Query'))
            ->will($this->returnValue(Promise\resolve($cachedRecords)));

        $cachedExecutor = new CachedExecutor($executor, $cache);

        $query = new Query('igor.io', Message::TYPE_A, Message::CLASS_IN, 1345656451);
        $cachedExecutor->query('8.8.8.8', $query, function () {}, function () {});
        $cachedExecutor->query('8.8.8.8', $query, function () {}, function () {});
    }

    private function callQueryCallbackWithAddress($address)
    {
        return $this->returnCallback(function ($nameserver, $query) use ($address) {
            $response = new Message();
            $response->header->set('qr', 1);
            $response->questions[] = new Record($query->name, $query->type, $query->class);
            $response->answers[] = new Record($query->name, $query->type, $query->class, 3600, $address);

            return Promise\resolve($response);
        });
    }

    protected function expectCallableOnce()
    {
        $mock = $this->createCallableMock();
        $mock
            ->expects($this->once())
            ->method('__invoke');

        return $mock;
    }

    protected function createCallableMock()
    {
        return $this->getMock('React\Tests\Socket\Stub\CallableStub');
    }

    private function createExecutorMock()
    {
        return $this->getMock('React\Dns\Query\ExecutorInterface');
    }

    private function createPromiseMock()
    {
        return $this->getMock('React\Promise\PromiseInterface');
    }
}
