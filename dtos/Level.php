<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 레벨 구조체를 정의한다.
 *
 * @file /modules/member/dtos/Level.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 29.
 */
namespace modules\member\dtos;
class Level
{
    /**
     * @var int $_id 레벨고유값
     */
    private int $_id;

    /**
     * @var string $_title 레벨명
     */
    private string $_title;

    /**
     * @var int $_members 회원수
     */
    private int $_members = 0;

    /**
     * 레벨 구조체를 정의한다.
     *
     * @param object $level 레벨정보
     */
    public function __construct(object $level)
    {
        $this->_id = $level->level_id;
        $this->_title = $level->title;
        $this->_members = $level->members;
    }

    /**
     * 고유값을 가져온다.
     *
     * @return int $id
     */
    public function getId(): int
    {
        return $this->_id;
    }

    /**
     * 레멜명을 가져온다.
     *
     * @return string $title
     */
    public function getTitle(): string
    {
        return $this->_title;
    }

    /**
     * 소속회원수를 가져온다.
     *
     * @return int $members
     */
    public function getMembers(): int
    {
        return $this->_members;
    }

    /**
     * 레벨정보를 갱신한다.
     */
    public function update(): void
    {
        /**
         * @var \modules\member\Member $mMember
         */
        $mMember = \Modules::get('member');
        $this->_members = $mMember
            ->db()
            ->select()
            ->from($mMember->table('members'))
            ->where('level_id', $this->_id)
            ->count();
        $mMember
            ->db()
            ->update($mMember->table('levels'), ['members' => $this->_members])
            ->where('level_id', $this->_id)
            ->execute();
    }

    /**
     * 그룹정보를 JSON 으로 가져온다.
     *
     * @return object $json
     */
    public function getJson(): object
    {
        $level = new \stdClass();
        $level->level_id = $this->_id;
        $level->title = $this->_title;
        $level->members = $this->getMembers();

        return $level;
    }
}
